/**
 * Auth-module-owned domain types.
 * Foundation types (Language, ThemeMode, UserRole, AppUser) live in
 * @/types and are not duplicated here — this file only adds what the
 * Authentication module itself introduces.
 */
import type { AppUser, UserRole } from "@/types";

/** Authenticated user shape — extends the foundation AppUser with auth fields. */
export interface AuthUser extends AppUser {
  email: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

/** What an OTP code is being requested/verified for. */
export type OtpPurpose = "signup" | "reset";

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

/** Thrown by the mock auth service — carries a translation-safe error code. */
export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_exists"
  | "email_not_verified"
  | "user_not_found"
  | "invalid_otp"
  | "otp_expired"
  | "otp_not_verified";

export type { UserRole };
