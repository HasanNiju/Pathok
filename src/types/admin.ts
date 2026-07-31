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
