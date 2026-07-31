"use client";

import { BookOpen } from "lucide-react";
import { BookRail } from "@/components/home/book-rail";
import { EmptyState } from "@/components/home/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { getBookById } from "@/data/books";
import type { ReadingHistoryEntry } from "@/types/dashboard";
import type { Book } from "@/types/book";

interface ContinueReadingSectionProps {
  entries: ReadingHistoryEntry[];
}

/** One-click resume rail — the fast path back into whatever's already open,
 *  distinct from Reading Progress below it (which shows the same books with
 *  full detail: dates, minutes spent, and a per-book progress readout). */
export function ContinueReadingSection({ entries }: ContinueReadingSectionProps) {
  const { t } = useTranslation();

  const books = entries
    .map((entry) => getBookById(entry.bookId))
    .filter((book): book is Book => Boolean(book));
  const progressByBookId = Object.fromEntries(entries.map((entry) => [entry.bookId, entry.progress]));

  if (books.length === 0) {
    return (
      <section id="continue-reading" className="scroll-mt-24">
        <SectionHeader title={t("dashboard.continueReading.title")} subtitle={t("dashboard.continueReading.subtitle")} />
        <EmptyState
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title={t("dashboard.continueReading.emptyTitle")}
          description={t("dashboard.continueReading.emptyDescription")}
        />
      </section>
    );
  }

  return (
    <BookRail
      id="continue-reading"
      title={t("dashboard.continueReading.title")}
      subtitle={t("dashboard.continueReading.subtitle")}
      books={books}
      progressByBookId={progressByBookId}
    />
  );
}
