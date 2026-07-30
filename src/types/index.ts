/**
 * Foundation-level shared types only.
 * Domain types belong to the modules that own them — see @/types/auth.ts
 * (Auth) and @/types/book.ts (Home/Library) — not here.
 */

/** Supported UI languages. Keys must match the translation dictionaries. */
export type Language = "en" | "bn";

/** Theme modes surfaced to the user, backed by next-themes. */
export type ThemeMode = "light" | "dark" | "system";

/** The three user types defined in the PRD. */
export type UserRole = "guest" | "user" | "admin";

/** Minimal identity shape shared across the app before Auth module exists. */
export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}
