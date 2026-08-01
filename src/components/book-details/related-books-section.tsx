"use client";

import { BookRail } from "@/components/home/book-rail";
import { useTranslation } from "@/hooks/use-translation";
import { useBooks } from "@/hooks/use-books";
import { recommendBooks } from "@/lib/recommendations";
import type { Book } from "@/types/book";

export function RelatedBooksSection({ book }: { book: Book }) {
  const { t } = useTranslation();
  const { books } = useBooks();

  // Reuses this book itself as the "recently read" seed so the engine's
  // same-category/same-author priority ranks against *this* book.
  const related = recommendBooks({
    books,
    history: [{ userId: "", bookId: book.id, progress: 0, lastReadAt: new Date().toISOString() }],
    excludeBookId: book.id,
  });

  return (
    <BookRail
      id="related-books"
      title={t("bookDetails.related.title")}
      subtitle={t("bookDetails.related.subtitle")}
      books={related}
    />
  );
}
