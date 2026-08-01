"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useBooks } from "@/hooks/use-books";
import { createClient } from "@/lib/supabase/client";
import { fetchReadingProgressForUser } from "@/lib/supabase/progress-service";
import { BookRail } from "@/components/home/book-rail";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { Button } from "@/components/ui/button";
import type { Book, ReadingProgress } from "@/types/book";

export function ContinueReadingSection() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { books } = useBooks();
  const [progressEntries, setProgressEntries] = useState<ReadingProgress[]>([]);

  useEffect(() => {
    if (!user) {
      setProgressEntries([]);
      return;
    }
    fetchReadingProgressForUser(createClient(), user.id).then(setProgressEntries);
  }, [user]);

  const title = t("home.continueReading.title");
  const subtitle = t("home.continueReading.subtitle");

  if (!user) {
    return (
      <section id="continue-reading" className="scroll-mt-24">
        <SectionHeader title={title} subtitle={subtitle} />
        <EmptyState
          icon={<LogIn className="h-5 w-5" aria-hidden="true" />}
          title={t("home.continueReading.emptyGuestTitle")}
          description={t("home.continueReading.emptyGuestDescription")}
          action={
            <Link href="/login">
              <Button size="sm">{t("home.continueReading.emptyGuestCta")}</Button>
            </Link>
          }
        />
      </section>
    );
  }

  const inProgress = progressEntries.filter((entry) => entry.progress < 100);
  const readingBooks = inProgress
    .map((entry) => books.find((book) => book.id === entry.bookId))
    .filter((book): book is Book => Boolean(book));
  const progressByBookId = Object.fromEntries(inProgress.map((entry) => [entry.bookId, entry.progress]));

  if (readingBooks.length === 0) {
    return (
      <section id="continue-reading" className="scroll-mt-24">
        <SectionHeader title={title} subtitle={subtitle} />
        <EmptyState
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title={t("home.continueReading.emptyUserTitle")}
          description={t("home.continueReading.emptyUserDescription")}
        />
      </section>
    );
  }

  return (
    <BookRail
      id="continue-reading"
      title={title}
      subtitle={subtitle}
      books={readingBooks}
      progressByBookId={progressByBookId}
    />
  );
}
