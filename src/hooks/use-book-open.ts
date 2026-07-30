"use client";

import { useRouter } from "next/navigation";

/**
 * Returns a stable click handler for book covers/cards across the app —
 * navigates to that book's Book Details page (/books/[id]), introduced by
 * the Book Details module. Callers pass the specific book's id per click,
 * e.g. onClick={() => openBook(book.id)}.
 */
export function useOpenBook() {
  const router = useRouter();

  return (bookId: string) => router.push(`/books/${bookId}`);
}
