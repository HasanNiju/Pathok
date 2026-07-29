"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { readerContent } from "@/data/reader-content";

interface ReaderViewProps {
  bookId: string;
  title: string;
  author: string;
}

export function ReaderView({ bookId, title, author }: ReaderViewProps) {
  const { t } = useTranslation();
  const chapters = readerContent[bookId] ?? [];
  const [chapterIndex, setChapterIndex] = useState(0);

  const chapter = chapters[chapterIndex];
  const progress = useMemo(() => {
    if (!chapters.length) return 0;
    return ((chapterIndex + 1) / chapters.length) * 100;
  }, [chapterIndex, chapters.length]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Card className="border-border/70 bg-card/90 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">{t("book.reader.title")}</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{author}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm text-muted-foreground">
            <Menu className="h-4 w-4" aria-hidden="true" />
            {t("book.reader.chapterLabel")}
          </div>
        </div>
      </Card>

      <Card className="border-border/70 bg-card/90 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-semibold">{chapter?.title ?? t("book.reader.empty")}</span>
          </div>
          <div className="text-sm text-muted-foreground">{Math.round(progress)}%</div>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>

        <motion.article
          key={chapter?.id ?? "empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-8 space-y-5"
        >
          {chapter?.content?.map((paragraph, index) => (
            <p key={`${chapter.id}-${index}`} className="text-[1.02rem] leading-8 text-foreground/90">
              {paragraph}
            </p>
          ))}
        </motion.article>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => setChapterIndex((value) => Math.max(0, value - 1))}
            disabled={chapterIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t("book.reader.previous")}
          </Button>

          <Button
            variant="primary"
            onClick={() => setChapterIndex((value) => Math.min(chapters.length - 1, value + 1))}
            disabled={chapterIndex >= chapters.length - 1}
          >
            {t("book.reader.next")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
