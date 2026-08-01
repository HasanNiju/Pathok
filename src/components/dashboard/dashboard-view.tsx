"use client";

import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";
import { StatsSection } from "@/components/dashboard/stats-section";
import { ContinueReadingSection } from "@/components/dashboard/continue-reading-section";
import { ReadingProgressSection } from "@/components/dashboard/reading-progress-section";
import { ReadingHistorySection } from "@/components/dashboard/reading-history-section";
import { CompletedBooksSection } from "@/components/dashboard/completed-books-section";
import { BookmarksSection } from "@/components/dashboard/bookmarks-section";
import { FavoritesSection } from "@/components/dashboard/favorites-section";
import { AchievementsSection } from "@/components/dashboard/achievements-section";
import { SettingsShortcutSection } from "@/components/dashboard/settings-shortcut-section";
import { Loading } from "@/components/ui/loading";

/**
 * User Dashboard — a single scrollable page composed of every section from
 * the module PRD, each one a thin wrapper around data already owned by
 * earlier modules (see use-dashboard.ts for the aggregation). Sections are
 * independent: any one of them can be reordered or removed without the
 * others needing to change.
 */
export function DashboardView() {
  const { user } = useAuth();
  const { isHydrated, books, history, inProgress, completed, favoriteBooks, bookmarkedBooks, stats, achievements } =
    useDashboard();

  if (!user || !isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-12">
      <DashboardHeader />
      <DashboardSubnav />

      <StatsSection stats={stats} />
      <ContinueReadingSection entries={inProgress} books={books} />
      <ReadingProgressSection entries={inProgress} books={books} />
      <ReadingHistorySection entries={history} books={books} />
      <CompletedBooksSection entries={completed} books={books} />
      <BookmarksSection books={bookmarkedBooks} />
      <FavoritesSection books={favoriteBooks} />
      <AchievementsSection achievements={achievements} />
      <SettingsShortcutSection />
    </div>
  );
}
