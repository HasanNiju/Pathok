"use client";

import { Circle } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { useTranslation } from "@/hooks/use-translation";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";

interface AdminPlaceholderProps {
  /** Matches an ADMIN_NAV_ITEMS key (e.g. "books") — resolves both the
   *  icon and the nav label internally, so callers never pass a component
   *  reference across the server/client boundary. */
  navKey: string;
  subtitleKey: string;
}

/** Reserved page for a sidebar section not built in this module yet
 *  (Books, Categories, Users, Branding, Settings management). Mirrors the
 *  "reserved for a future module" pattern already used by /create. */
export function AdminPlaceholder({ navKey, subtitleKey }: AdminPlaceholderProps) {
  const { t } = useTranslation();
  const navItem = ADMIN_NAV_ITEMS.find((item) => item.key === navKey);
  const Icon = navItem?.icon ?? Circle;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SectionHeader title={t(`admin.nav.${navKey}`)} subtitle={t(subtitleKey)} />
      <EmptyState
        icon={<Icon className="h-5 w-5" aria-hidden="true" />}
        title={t("admin.placeholder.title")}
        description={t("admin.placeholder.description")}
      />
    </div>
  );
}
