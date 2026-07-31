"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { ADMIN_QUICK_ACTIONS } from "@/constants/admin";

/** Shortcut tiles to the most common admin tasks. */
export function AdminQuickActionsSection() {
  const { t } = useTranslation();

  return (
    <section>
      <SectionHeader title={t("admin.quickActions.title")} subtitle={t("admin.quickActions.subtitle")} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.key}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
            >
              <Link href={action.href}>
                <Card className="flex h-full items-center gap-3 p-4 transition-colors duration-200 hover:bg-secondary/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{t(action.titleKey)}</span>
                    <span className="truncate text-xs text-muted-foreground">{t(action.descriptionKey)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
