"use client";

import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { DashboardBookGrid } from "@/components/dashboard/dashboard-book-grid";
import { useTranslation } from "@/hooks/use-translation";
import { getBookById } from "@/data/books";
import type { ReadingHistoryEntry } from "@/types/dashboard";
import type { Book } from "@/types/book";

interface CompletedBooksSectionProps {
  entries: ReadingHistoryEntry[];
}

export function CompletedBooksSection({ entries }: CompletedBooksSectionProps) {
  const { t } = useTranslation();
  const books = entries
    .map((entry) => getBookById(entry.bookId))
    .filter((book): book is Book => Boolean(book));

  return (
    <section id="completed-books" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.completed.title")} subtitle={t("dashboard.completed.subtitle")} />
      <DashboardBookGrid
        books={books}
        emptyIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
        emptyTitle={t("dashboard.completed.emptyTitle")}
        emptyDescription={t("dashboard.completed.emptyDescription")}
      />
    </section>
  );
}
