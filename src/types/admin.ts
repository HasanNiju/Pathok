/**
 * Admin-module-owned domain types.
 * Foundation types (Language, ThemeMode, UserRole, AppUser) live in
 * @/types and are not duplicated here — this file only adds what the
 * Admin Dashboard module introduces. No backend per the PRD: stats are
 * derived at read-time from data other modules already seed.
 */
import type { LucideIcon } from "lucide-react";

/** One entry in the admin sidebar. */
export interface AdminNavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  /** Restricts this nav item to specific roles; omit to show to any admin. */
  roles?: ("admin" | "super_admin")[];
}

/** A single dummy metric tile on the Overview page. */
export interface AdminStat {
  key: string;
  icon: LucideIcon;
  labelKey: string;
  value: string;
}

/** A shortcut card in the Quick Actions section. */
export interface AdminQuickAction {
  key: string;
  href: string;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

/** A row in the User Management list — merges auth.users (email) with profiles. */
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended";
  avatarUrl?: string;
  createdAt: string;
}

/** Branding settings (Module 05), stored in site_settings under key "branding". */
export interface BrandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  accentColor: string;
}

/** Global Settings (Module 06). */
export interface GeneralSettings {
  defaultTheme: "light" | "dark" | "system";
  defaultLanguage: "en" | "bn";
}

export interface ReaderDefaultSettings {
  fontFamily: "sans" | "serif" | "literary";
  fontSize: number;
  readingWidth: "narrow" | "comfortable" | "wide";
}

export interface UploadSettings {
  allowedTypes: ("pdf" | "docx")[];
  maxUploadSizeMb: number;
}
