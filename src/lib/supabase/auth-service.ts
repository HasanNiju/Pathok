"use client";

/**
 * Real authentication service — replaces mock-auth.ts.
 * Same function names/shapes as the mock, so AuthProvider barely changes.
 */
import { createClient } from "@/lib/supabase/client";
import { AuthError, type AuthUser, type LoginInput, type OtpPurpose, type SignupInput } from "@/types/auth";

const supabase = createClient();

function mapError(message: string): AuthError {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return new AuthError("invalid_credentials", "Incorrect email or password.");
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return new AuthError("email_exists", "An account with this email already exists.");
  }
  if (m.includes("email not confirmed")) {
    return new AuthError("email_not_verified", "Please verify your email before logging in.");
  }
  if (m.includes("expired")) {
    return new AuthError("otp_expired", "This code has expired. Request a new one.");
  }
  if (m.includes("token") || m.includes("otp")) {
    return new AuthError("invalid_otp", "The code you entered is incorrect.");
  }
  return new AuthError("invalid_credentials", message);
}

async function profileToAuthUser(userId: string, email: string, isEmailVerified: boolean): Promise<AuthUser> {
  const { data } = await supabase.from("profiles").select("name, role, avatar_url, status").eq("id", userId).single();

  return {
    id: userId,
    email,
    name: data?.name ?? "Reader",
    role: (data?.role as AuthUser["role"]) ?? "user",
    avatarUrl: data?.avatar_url ?? undefined,
    isEmailVerified,
    status: (data?.status as "active" | "suspended") ?? "active",
  };
}

export const realAuth = {
  async signup(input: SignupInput): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name } },
    });
    if (error) throw mapError(error.message);
    if (!data.user) throw mapError("Signup failed.");

    return {
      id: data.user.id,
      email: input.email,
      name: input.name,
      role: "user",
      isEmailVerified: false,
    };
  },

  async login(input: LoginInput): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) throw mapError(error.message);
    if (!data.user) throw mapError("Login failed.");

    const authUser = await profileToAuthUser(data.user.id, data.user.email ?? input.email, !!data.user.email_confirmed_at);
    if (authUser.status === "suspended") {
      await supabase.auth.signOut();
      throw new AuthError("account_suspended", "This account has been suspended.");
    }
    return authUser;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** Signup codes are sent automatically by signUp() — nothing to trigger here. */
  async requestOtp(email: string, purpose: OtpPurpose): Promise<string> {
    if (purpose === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw mapError(error.message);
    }
    return "";
  },

  async resendOtp(email: string, purpose: OtpPurpose): Promise<string> {
    if (purpose === "signup") {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw mapError(error.message);
      return "";
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw mapError(error.message);
    return "";
  },

  async verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: purpose === "signup" ? "signup" : "recovery",
    });
    if (error) throw mapError(error.message);
  },

  /** Relies on the session created by verifyOtp("reset") just before this is called. */
  async resetPassword(_email: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw mapError(error.message);
  },

  async getSessionUser(): Promise<AuthUser | null> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return profileToAuthUser(data.user.id, data.user.email ?? "", !!data.user.email_confirmed_at);
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      const user = await profileToAuthUser(
        session.user.id,
        session.user.email ?? "",
        !!session.user.email_confirmed_at
      );
      callback(user);
    });
    return data.subscription;
  },
};
