import { AuthError, type AuthErrorCode } from "@/types/auth";

/** Dot-path translation key for each known auth error code. */
const ERROR_KEYS: Record<AuthErrorCode, string> = {
  invalid_credentials: "auth.errors.invalidCredentials",
  email_exists: "auth.errors.emailExists",
  email_not_verified: "auth.errors.emailNotVerified",
  user_not_found: "auth.errors.userNotFound",
  invalid_otp: "auth.errors.invalidOtp",
  otp_expired: "auth.errors.otpExpired",
  otp_not_verified: "auth.errors.otpNotVerified",
};

/** Resolves any thrown error to a translation key, falling back to a generic one. */
export function resolveAuthErrorKey(error: unknown): string {
  if (error instanceof AuthError) {
    return ERROR_KEYS[error.code];
  }
  return "auth.errors.generic";
}
