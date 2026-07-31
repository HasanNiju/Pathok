"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/home/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { getBookById } from "@/data/books";
import { formatDate } from "@/lib/utils";
import type { ReadingHistoryEntry } from "@/types/dashboard";

interface ReadingProgressSectionProps {
  entries: ReadingHistoryEntry[];
}

/** Detailed breakdown of every in-progress book — percentage, last-read
 *  date, and (when known from a live Reader session) minutes spent —
 *  each row resuming straight into the Reader on click. */
export function ReadingProgressSection({ entries }: ReadingProgressSectionProps) {
  const { t, language } = useTranslation();
  const router = useRouter();

  return (
    <section id="reading-progress" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.readingProgress.title")} subtitle={t("dashboard.readingProgress.subtitle")} />

      {entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title={t("dashboard.readingProgress.emptyTitle")}
          description={t("dashboard.readingProgress.emptyDescription")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, index) => {
            const book = getBookById(entry.bookId);
            if (!book) return null;

            return (
              <motion.div
                key={entry.bookId}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.03, ease: "easeOut" }}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/read/${book.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/read/${book.id}`);
                    }
                  }}
                  className="cursor-pointer transition-shadow duration-200 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {book.coverUrl ? (
                        <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <p className="truncate text-sm font-bold text-foreground">{book.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-200"
                            style={{ width: `${entry.progress}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">{entry.progress}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("dashboard.readingProgress.lastRead").replace("{date}", formatDate(entry.lastReadAt, language))}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("dashboard.readingProgress.resume")}
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/read/${book.id}`);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
