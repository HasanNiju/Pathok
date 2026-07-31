"use client";

import { BookOpen, LayoutGrid, Users, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useTranslation } from "@/hooks/use-translation";
import { getAdminStats } from "@/data/admin";

/** Dummy Statistics Cards for the Overview page — reuses the dashboard
 *  module's StatCard rather than duplicating a near-identical tile. */
export function AdminStatsSection() {
  const { t } = useTranslation();
  const stats = getAdminStats();

  const items = [
    { key: "totalBooks", icon: BookOpen, label: t("admin.stats.totalBooks"), value: String(stats.totalBooks) },
    {
      key: "totalCategories",
      icon: LayoutGrid,
      label: t("admin.stats.totalCategories"),
      value: String(stats.totalCategories),
    },
    { key: "totalUsers", icon: Users, label: t("admin.stats.totalUsers"), value: String(stats.totalUsers) },
    {
      key: "totalReviews",
      icon: MessageSquare,
      label: t("admin.stats.totalReviews"),
      value: String(stats.totalReviews),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item, index) => (
        <StatCard key={item.key} icon={item.icon} label={item.label} value={item.value} delay={index * 0.03} />
      ))}
    </div>
  );
}
