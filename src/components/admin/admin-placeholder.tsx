"use client";

import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { useTranslation } from "@/hooks/use-translation";

interface AdminPlaceholderProps {
  icon: LucideIcon;
  titleKey: string;
  subtitleKey: string;
}

/** Reserved page for a sidebar section not built in this module yet
 *  (Books, Categories, Users, Branding, Settings management). Mirrors the
 *  "reserved for a future module" pattern already used by /create. */
export function AdminPlaceholder({ icon: Icon, titleKey, subtitleKey }: AdminPlaceholderProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SectionHeader title={t(titleKey)} subtitle={t(subtitleKey)} />
      <EmptyState
        icon={<Icon className="h-5 w-5" aria-hidden="true" />}
        title={t("admin.placeholder.title")}
        description={t("admin.placeholder.description")}
      />
    </div>
  );
}
