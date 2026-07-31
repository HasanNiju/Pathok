"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/home/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { useOpenBook } from "@/hooks/use-book-open";
import { useTranslation } from "@/hooks/use-translation";
import { getBookById } from "@/data/books";
import { formatDate } from "@/lib/utils";
import { HISTORY_PAGE_SIZE } from "@/constants/dashboard";
import type { ReadingHistoryEntry } from "@/types/dashboard";

interface ReadingHistorySectionProps {
  entries: ReadingHistoryEntry[];
}

/** Every book the user has ever opened, most recent activity first —
 *  in-progress and completed alike. Distinct from Reading Progress (which
 *  filters to in-progress only) and Completed Books (which drops the
 *  timeline in favor of a plain grid). */
export function ReadingHistorySection({ entries }: ReadingHistorySectionProps) {
  const { t, language } = useTranslation();
  const openBook = useOpenBook();
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE_SIZE);

  const visible = entries.slice(0, visibleCount);

  return (
    <section id="reading-history" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.history.title")} subtitle={t("dashboard.history.subtitle")} />

      {entries.length === 0 ? (
        <EmptyState
          icon={<History className="h-5 w-5" aria-hidden="true" />}
          title={t("dashboard.history.emptyTitle")}
          description={t("dashboard.history.emptyDescription")}
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {visible.map((entry, index) => {
            const book = getBookById(entry.bookId);
            if (!book) return null;

            return (
              <motion.button
                key={entry.bookId}
                type="button"
                onClick={() => openBook(book.id)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.02, ease: "easeOut" }}
                className="flex w-full items-center gap-3 p-3.5 text-left transition-colors duration-200 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-4"
              >
                <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {book.coverUrl && (
                    <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="36px" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{book.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{formatDate(entry.lastReadAt, language)}</p>
                </div>

                {entry.isCompleted ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    {t("dashboard.history.completedBadge")}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{entry.progress}%</span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {visibleCount < entries.length && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setVisibleCount((count) => count + HISTORY_PAGE_SIZE)}>
            {t("dashboard.history.showMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
