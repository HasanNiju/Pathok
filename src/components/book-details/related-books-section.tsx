"use client";

import { BookRail } from "@/components/home/book-rail";
import { useTranslation } from "@/hooks/use-translation";
import { getBooksByCategory, getRecommendedBooks } from "@/data/books";
import type { Book } from "@/types/book";

export function RelatedBooksSection({ book }: { book: Book }) {
  const { t } = useTranslation();

  const sameGenre = getBooksByCategory(book.categorySlug).filter((candidate) => candidate.id !== book.id);
  const related = sameGenre.length > 0
    ? sameGenre
    : getRecommendedBooks().filter((candidate) => candidate.id !== book.id);

  return (
    <BookRail
      id="related-books"
      title={t("bookDetails.related.title")}
      subtitle={t("bookDetails.related.subtitle")}
      books={related}
    />
  );
}
