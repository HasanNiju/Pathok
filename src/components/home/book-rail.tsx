"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard } from "@/components/ui/book-card";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { useOpenBook } from "@/hooks/use-book-open";
import type { Book } from "@/types/book";

interface BookRailProps {
  id?: string;
  title: string;
  subtitle?: string;
  books: Book[];
  /** Reading progress (0–100) keyed by book id, for rails that show it (e.g. Continue Reading). */
  progressByBookId?: Record<string, number>;
}

/**
 * Horizontally scrollable shelf of books, used by every Home rail (Latest,
 * Trending, Popular, Recommended, Recently Added, Continue Reading).
 * Renders nothing if there are no books to show, so callers don't need to
 * guard empty sections themselves.
 */
export function BookRail({ id, title, subtitle, books, progressByBookId }: BookRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const handleOpenBook = useOpenBook();

  if (books.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id={id} className="scroll-mt-24">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <div className="hidden gap-1 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={t("common.previous")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={t("common.next")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        }
      />

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.03, ease: "easeOut" }}
            className="w-36 shrink-0 snap-start sm:w-40 md:w-44 lg:w-48"
          >
            <BookCard
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              progress={progressByBookId?.[book.id]}
              onClick={handleOpenBook}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
