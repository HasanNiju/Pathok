import type { Book } from "@/types/book";
import booksJson from "./books.json";

/**
 * Dummy book catalog. Per the PRD there is no backend — this is the single
 * source of truth every Home rail reads from. Swapping this for a real API
 * later should only require changing this file, not its consumers.
 */
export const books: Book[] = booksJson as Book[];

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

/** Newest releases by publication date — distinct from "recently added". */
export function getLatestBooks(limit = 12): Book[] {
  return [...books]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

/** Hand-picked trending titles, ordered by their editorial rank. */
export function getTrendingBooks(limit = 12): Book[] {
  return books
    .filter((book) => typeof book.trendingRank === "number")
    .sort((a, b) => (a.trendingRank ?? 0) - (b.trendingRank ?? 0))
    .slice(0, limit);
}

/** All-time most-read titles. */
export function getPopularBooks(limit = 12): Book[] {
  return [...books].sort((a, b) => b.readCount - a.readCount).slice(0, limit);
}

/** Editorial picks, falling back to top-rated titles if none are flagged. */
export function getRecommendedBooks(limit = 12): Book[] {
  const picked = books.filter((book) => book.isRecommended);
  if (picked.length >= limit) return picked.slice(0, limit);

  const rest = [...books]
    .filter((book) => !book.isRecommended)
    .sort((a, b) => b.rating - a.rating);

  return [...picked, ...rest].slice(0, limit);
}

/** Most recently added to the Pathok catalog — distinct from "latest books". */
export function getRecentlyAddedBooks(limit = 12): Book[] {
  return [...books].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit);
}

export function getBooksByCategory(categorySlug: string, limit?: number): Book[] {
  const matches = books.filter((book) => book.categorySlug === categorySlug);
  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

/** Simple client-side search across title, author, and category. */
export function searchBooks(query: string): Book[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(normalized) ||
      book.author.toLowerCase().includes(normalized) ||
      book.categorySlug.toLowerCase().includes(normalized)
  );
}
