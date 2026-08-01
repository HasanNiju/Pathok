import {
  LayoutDashboard,
  BookOpen,
  LayoutGrid,
  Users,
  Palette,
  Settings,
  UploadCloud,
  ShieldCheck,
} from "lucide-react";
import type { AdminNavItem, AdminQuickAction } from "@/types/admin";

/** Sidebar destinations, in display order — per the module PRD. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "books", href: "/admin/books", icon: BookOpen },
  { key: "categories", href: "/admin/categories", icon: LayoutGrid },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "admins", href: "/admin/admins", icon: ShieldCheck, roles: ["super_admin"] },
  { key: "branding", href: "/admin/branding", icon: Palette },
  { key: "settings", href: "/admin/settings", icon: Settings },
];

/** Overview page shortcuts. "uploadBook" reuses the existing /create page
 *  rather than duplicating an upload flow. */
export const ADMIN_QUICK_ACTIONS: AdminQuickAction[] = [
  {
    key: "uploadBook",
    href: "/create",
    icon: UploadCloud,
    titleKey: "admin.quickActions.uploadBook",
    descriptionKey: "admin.quickActions.uploadBookDescription",
  },
  {
    key: "manageCategories",
    href: "/admin/categories",
    icon: LayoutGrid,
    titleKey: "admin.quickActions.manageCategories",
    descriptionKey: "admin.quickActions.manageCategoriesDescription",
  },
  {
    key: "manageUsers",
    href: "/admin/users",
    icon: Users,
    titleKey: "admin.quickActions.manageUsers",
    descriptionKey: "admin.quickActions.manageUsersDescription",
  },
  {
    key: "branding",
    href: "/admin/branding",
    icon: Palette,
    titleKey: "admin.quickActions.branding",
    descriptionKey: "admin.quickActions.brandingDescription",
  },
];
