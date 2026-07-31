"use client";

import { BookOpen, CheckCircle2, Clock, Compass, Heart, Bookmark } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { useTranslation } from "@/hooks/use-translation";
import type { DashboardStats } from "@/types/dashboard";

interface StatsSectionProps {
  stats: DashboardStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const { t } = useTranslation();

  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;
  const timeValue = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const items = [
    { icon: BookOpen, label: t("dashboard.stats.inProgress"), value: String(stats.booksInProgress) },
    { icon: CheckCircle2, label: t("dashboard.stats.completed"), value: String(stats.booksCompleted) },
    { icon: Clock, label: t("dashboard.stats.timeSpent"), value: timeValue },
    { icon: Compass, label: t("dashboard.stats.categories"), value: String(stats.categoriesExplored) },
    { icon: Heart, label: t("dashboard.stats.favorites"), value: String(stats.favoritesCount) },
    { icon: Bookmark, label: t("dashboard.stats.bookmarks"), value: String(stats.bookmarksCount) },
  ];

  return (
    <section id="statistics" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.stats.title")} subtitle={t("dashboard.stats.subtitle")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item, index) => (
          <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} delay={index * 0.03} />
        ))}
      </div>
    </section>
  );
}
