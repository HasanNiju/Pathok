/**
 * Mock authentication service.
 *
 * Per the PRD: no backend, no real network calls. This module simulates
 * one with an in-memory + localStorage-backed "database" of users and OTP
 * codes, artificial latency, and the same error shapes a real API would
 * return. Swapping this file for real HTTP calls later should not require
 * changing AuthProvider's public surface.
 *
 * SECURITY NOTE: passwords are kept in plain text here purely because this
 * is a mock/demo data layer with no server. Never do this in production.
 */
import { STORAGE_KEYS } from "@/constants";
import { AuthError, type AuthUser, type LoginInput, type OtpPurpose, type SignupInput } from "@/types/auth";

interface MockDbUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AuthUser["role"];
  isEmailVerified: boolean;
  avatarUrl?: string;
}

interface OtpRecord {
  email: string;
  purpose: OtpPurpose;
  code: string;
  expiresAt: number;
  verified: boolean;
}

const DB_KEY = "pathok:mock-users-db";
const OTP_KEY = "pathok:mock-otp-store";
const OTP_TTL_MS = 5 * 60 * 1000;
const NETWORK_DELAY_MS = 600;

// Seed accounts so login/role-gating can be tried immediately, without
// running the full signup + OTP flow first.
const SEED_USERS: MockDbUser[] = [
  {
    id: "seed-admin",
    name: "Admin Demo",
    email: "admin@pathok.app",
    password: "Admin@123",
    role: "admin",
    isEmailVerified: true,
  },
  {
    id: "seed-user",
    name: "Reader Demo",
    email: "user@pathok.app",
    password: "User@123",
    role: "user",
    isEmailVerified: true,
  },
];

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readDb(): MockDbUser[] {
  if (!isBrowser()) return SEED_USERS;
  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) {
    window.localStorage.setItem(DB_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(raw) as MockDbUser[];
  } catch {
    return SEED_USERS;
  }
}

function writeDb(users: MockDbUser[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(users));
}

function readOtpStore(): OtpRecord[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(OTP_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OtpRecord[];
  } catch {
    return [];
  }
}

function writeOtpStore(records: OtpRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(OTP_KEY, JSON.stringify(records));
}

function toAuthUser(dbUser: MockDbUser): AuthUser {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    isEmailVerified: dbUser.isEmailVerified,
    avatarUrl: dbUser.avatarUrl,
  };
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Creates/replaces the OTP for a given email+purpose and returns the code (mock "sends" it). */
async function issueOtp(email: string, purpose: OtpPurpose): Promise<string> {
  await delay();
  const code = generateOtp();
  const records = readOtpStore().filter(
    (record) => !(record.email === email && record.purpose === purpose)
  );
  records.push({ email, purpose, code, expiresAt: Date.now() + OTP_TTL_MS, verified: false });
  writeOtpStore(records);
  // No email backend exists, so the code is surfaced directly to the caller
  // (shown in the UI) — this is the accepted mock-auth pattern for OTP demos.
  return code;
}

async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<void> {
  await delay();
  const records = readOtpStore();
  const record = records.find((entry) => entry.email === email && entry.purpose === purpose);

  if (!record) {
    throw new AuthError("invalid_otp", "No OTP was requested for this email.");
  }
  if (Date.now() > record.expiresAt) {
    throw new AuthError("otp_expired", "This code has expired. Request a new one.");
  }
  if (record.code !== code) {
    throw new AuthError("invalid_otp", "The code you entered is incorrect.");
  }

  record.verified = true;
  writeOtpStore(records);
}

function requireVerifiedOtp(email: string, purpose: OtpPurpose) {
  const record = readOtpStore().find((entry) => entry.email === email && entry.purpose === purpose);
  if (!record?.verified) {
    throw new AuthError("otp_not_verified", "Please verify the code sent to your email first.");
  }
}

export const mockAuth = {
  async signup(input: SignupInput): Promise<AuthUser> {
    await delay();
    const users = readDb();
    const existing = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      throw new AuthError("email_exists", "An account with this email already exists.");
    }

    const user: MockDbUser = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      password: input.password,
      role: "user",
      isEmailVerified: false,
    };

    writeDb([...users, user]);
    return toAuthUser(user);
  },

  async login(input: LoginInput): Promise<AuthUser> {
    await delay();
    const users = readDb();
    const match = users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase() && u.password === input.password
    );

    if (!match) {
      throw new AuthError("invalid_credentials", "Incorrect email or password.");
    }
    if (!match.isEmailVerified) {
      throw new AuthError("email_not_verified", "Please verify your email before logging in.");
    }

    return toAuthUser(match);
  },

  async requestOtp(email: string, purpose: OtpPurpose): Promise<string> {
    const users = readDb();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      throw new AuthError("user_not_found", "No account found with this email.");
    }
    return issueOtp(email, purpose);
  },

  async resendOtp(email: string, purpose: OtpPurpose): Promise<string> {
    return issueOtp(email, purpose);
  },

  async verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<void> {
    await verifyOtp(email, purpose, code);

    if (purpose === "signup") {
      const users = readDb();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.isEmailVerified = true;
        writeDb(users);
      }
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    await delay();
    requireVerifiedOtp(email, "reset");

    const users = readDb();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new AuthError("user_not_found", "No account found with this email.");
    }
    user.password = newPassword;
    writeDb(users);

    // Consume the reset OTP so it can't be replayed for another reset.
    writeOtpStore(readOtpStore().filter((r) => !(r.email === email && r.purpose === "reset")));
  },

  // --- Session persistence -------------------------------------------------
  // "Remember Me" checked -> localStorage (survives browser restart).
  // Unchecked -> sessionStorage (cleared when the tab/browser closes).

  persistSession(user: AuthUser, rememberMe: boolean) {
    if (!isBrowser()) return;
    const payload = JSON.stringify(user);
    if (rememberMe) {
      window.localStorage.setItem(STORAGE_KEYS.authSession, payload);
      window.sessionStorage.removeItem(STORAGE_KEYS.authSession);
    } else {
      window.sessionStorage.setItem(STORAGE_KEYS.authSession, payload);
      window.localStorage.removeItem(STORAGE_KEYS.authSession);
    }
  },

  readSession(): AuthUser | null {
    if (!isBrowser()) return null;
    const raw =
      window.localStorage.getItem(STORAGE_KEYS.authSession) ??
      window.sessionStorage.getItem(STORAGE_KEYS.authSession);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  clearSession() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEYS.authSession);
    window.sessionStorage.removeItem(STORAGE_KEYS.authSession);
  },
};
