import type { Book, ReadingProgress } from "@/types/book";
import { getPopularBooks, getRecentlyAddedBooks } from "@/lib/books";

export interface RecommendationInput {
  books: Book[];
  /** Current user's reading history, most recent first. */
  history?: ReadingProgress[];
  /** Recent search terms (most recent first) — see search_history table. */
  recentSearches?: string[];
  /** Excludes this book from its own recommendations (Book Details page). */
  excludeBookId?: string;
  limit?: number;
}

/**
 * Basic Recommendation System (Module 11). Pure, dependency-free, and
 * synchronous by design so it can run entirely client-side today and be
 * swapped for a server-side AI-backed ranking later without changing any
 * call site — every consumer just calls `recommendBooks(input)`.
 *
 * Priority: Continue Reading > Same Category > Same Author >
 * Recent Searches > Popular > Newly Added.
 */
export function recommendBooks(input: RecommendationInput): Book[] {
  const { books, history = [], recentSearches = [], excludeBookId, limit = 12 } = input;
  const seen = new Set<string>(excludeBookId ? [excludeBookId] : []);
  const results: Book[] = [];

  const push = (candidates: Book[]) => {
    for (const book of candidates) {
      if (results.length >= limit) return;
      if (seen.has(book.id)) continue;
      seen.add(book.id);
      results.push(book);
    }
  };

  // 1. Continue Reading — books already in progress, most recent first.
  const inProgressIds = [...history]
    .filter((entry) => entry.progress < 100)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt))
    .map((entry) => entry.bookId);
  push(inProgressIds.map((id) => books.find((book) => book.id === id)).filter((b): b is Book => Boolean(b)));

  // 2. Same category as recently-read books.
  const recentBookIds = history.slice(0, 5).map((entry) => entry.bookId);
  const recentCategories = new Set(
    recentBookIds.map((id) => books.find((book) => book.id === id)?.categorySlug).filter(Boolean)
  );
  if (recentCategories.size > 0) {
    push(books.filter((book) => recentCategories.has(book.categorySlug)).sort((a, b) => b.rating - a.rating));
  }

  // 3. Same author as recently-read books.
  const recentAuthors = new Set(
    recentBookIds.map((id) => books.find((book) => book.id === id)?.author).filter(Boolean)
  );
  if (recentAuthors.size > 0) {
    push(books.filter((book) => recentAuthors.has(book.author)));
  }

  // 4. Books matching recent search terms.
  for (const term of recentSearches.slice(0, 5)) {
    const normalized = term.trim().toLowerCase();
    if (!normalized) continue;
    push(
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(normalized) ||
          book.author.toLowerCase().includes(normalized) ||
          book.categorySlug.toLowerCase().includes(normalized)
      )
    );
  }

  // 5. Popular fallback.
  push(getPopularBooks(books, limit));

  // 6. Newly added fallback.
  push(getRecentlyAddedBooks(books, limit));

  return results.slice(0, limit);
}
