"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, LayoutGrid, Bookmark, PlusCircle, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  /** Only rendered when a signed-in reader/admin is present. */
  requiresAuth?: boolean;
  /** Only rendered for the admin role. */
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/", icon: Home },
  { key: "search", href: "/#search", icon: Search },
  { key: "categories", href: "/#categories", icon: LayoutGrid },
  { key: "continueReading", href: "/#continue-reading", icon: Bookmark, requiresAuth: true },
  { key: "create", href: "/create", icon: PlusCircle, adminOnly: true },
];

/** Shared between the persistent desktop sidebar and the mobile drawer. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return user?.role === "admin";
    if (item.requiresAuth) return Boolean(user);
    return true;
  });

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : false;

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Persistent app-shell sidebar. Below the md breakpoint navigation instead
 * lives in the Topbar's mobile drawer (see app-shell.tsx) — this component
 * only renders the desktop rail.
 */
export function Sidebar({ className }: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card md:flex md:w-60",
        "px-4 py-6",
        className
      )}
    >
      <SidebarNav />
    </motion.aside>
  );
}
