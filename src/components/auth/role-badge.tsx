"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<UserRole, string> = {
  guest: "bg-secondary text-secondary-foreground",
  user: "bg-primary/10 text-primary",
  admin: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function RoleBadge({ role }: { role: UserRole }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        ROLE_STYLES[role]
      )}
    >
      {t(`auth.roles.${role}`)}
    </span>
  );
}
