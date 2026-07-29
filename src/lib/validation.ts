/**
 * Shared, dependency-free validation helpers for the Auth module.
 * Kept framework-agnostic (no form library) per the PRD's
 * "no unnecessary libraries" rule — the existing stack has none installed.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidName(value: string): boolean {
  return value.trim().length >= 2;
}

/** Minimum bar a password must clear to be accepted anywhere in the app. */
export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

export type PasswordStrengthLabel = "weak" | "fair" | "good" | "strong";

export interface PasswordStrength {
  /** 0-4 */
  score: number;
  label: PasswordStrengthLabel;
}

/**
 * Rough, client-only strength heuristic — length + character variety.
 * Not cryptographic; purely a UX signal while the user is typing.
 */
export function getPasswordStrength(value: string): PasswordStrength {
  let score = 0;

  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const clamped = Math.min(score, 4);

  const labels: PasswordStrengthLabel[] = ["weak", "weak", "fair", "good", "strong"];

  return { score: clamped, label: labels[clamped] ?? "weak" };
}

export function isValidOtp(value: string): boolean {
  return /^\d{6}$/.test(value);
}
