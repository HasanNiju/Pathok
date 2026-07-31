"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookCard } from "@/components/ui/book-card";
import { EmptyState } from "@/components/home/empty-state";
import { useOpenBook } from "@/hooks/use-book-open";
import type { Book } from "@/types/book";
import type { ReactNode } from "react";

interface DashboardBookGridProps {
  books: Book[];
  progressByBookId?: Record<string, number>;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  /** Route Reading-Progress-style cards straight into the Reader instead of Book Details. */
  openInReader?: boolean;
}

/** Grid of BookCards shared by Completed Books, Bookmarks, and Favorites —
 *  each section only differs by which book list and empty-state copy it passes in. */
export function DashboardBookGrid({
  books,
  progressByBookId,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  openInReader,
}: DashboardBookGridProps) {
  const openBook = useOpenBook();
  const router = useRouter();

  if (books.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
        >
          <BookCard
            title={book.title}
            author={book.author}
            coverUrl={book.coverUrl}
            progress={progressByBookId?.[book.id]}
            onClick={() => (openInReader ? router.push(`/read/${book.id}`) : openBook(book.id))}
          />
        </motion.div>
      ))}
    </div>
  );
}
