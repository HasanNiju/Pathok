"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/auth/role-badge";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";

/** Greeting block at the top of the dashboard — who's signed in and a
 *  one-line summary, matching the identity block on the Account page. */
export function DashboardHeader() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatarUrl} size="lg" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("dashboard.greeting").replace("{name}", user.name.split(" ")[0] ?? user.name)}
          </h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
      </div>
      <RoleBadge role={user.role} />
    </motion.div>
  );
}
