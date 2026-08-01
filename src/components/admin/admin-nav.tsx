"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  onNavigate?: () => void;
}

/** Shared between the persistent desktop AdminSidebar and the mobile drawer,
 *  mirroring the split used by the main app's Sidebar/SidebarNav. */
export function AdminNav({ onNavigate }: AdminNavProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();
  const items = ADMIN_NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role as "admin" | "super_admin")));

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

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
            {t(`admin.nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
