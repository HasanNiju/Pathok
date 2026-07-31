"use client";

import { Bookmark } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { DashboardBookGrid } from "@/components/dashboard/dashboard-book-grid";
import { useTranslation } from "@/hooks/use-translation";
import type { Book } from "@/types/book";

interface BookmarksSectionProps {
  books: Book[];
}

export function BookmarksSection({ books }: BookmarksSectionProps) {
  const { t } = useTranslation();

  return (
    <section id="bookmarks" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.bookmarks.title")} subtitle={t("dashboard.bookmarks.subtitle")} />
      <DashboardBookGrid
        books={books}
        emptyIcon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
        emptyTitle={t("dashboard.bookmarks.emptyTitle")}
        emptyDescription={t("dashboard.bookmarks.emptyDescription")}
      />
    </section>
  );
}
