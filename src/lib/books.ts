import type { Book } from "@/types/book";

export function getBookById(books: Book[], id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

/** Newest releases by publication date — distinct from "recently added". */
export function getLatestBooks(books: Book[], limit = 12): Book[] {
  return [...books].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
}

/** Hand-picked trending titles, ordered by their editorial rank. */
export function getTrendingBooks(books: Book[], limit = 12): Book[] {
  return books
    .filter((book) => typeof book.trendingRank === "number")
    .sort((a, b) => (a.trendingRank ?? 0) - (b.trendingRank ?? 0))
    .slice(0, limit);
}

/** All-time most-read titles. */
export function getPopularBooks(books: Book[], limit = 12): Book[] {
  return [...books].sort((a, b) => b.readCount - a.readCount).slice(0, limit);
}

/** Editorial picks, falling back to top-rated titles if none are flagged. */
export function getRecommendedBooks(books: Book[], limit = 12): Book[] {
  const picked = books.filter((book) => book.isRecommended);
  if (picked.length >= limit) return picked.slice(0, limit);
  const rest = [...books].filter((book) => !book.isRecommended).sort((a, b) => b.rating - a.rating);
  return [...picked, ...rest].slice(0, limit);
}

/** Most recently added to the Pathok catalog — distinct from "latest books". */
export function getRecentlyAddedBooks(books: Book[], limit = 12): Book[] {
  return [...books].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit);
}

export function getBooksByCategory(books: Book[], categorySlug: string, limit?: number): Book[] {
  const matches = books.filter((book) => book.categorySlug === categorySlug);
  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

export interface SearchFilters {
  categorySlug?: string | null;
  language?: string | null;
  sort?: "relevance" | "alphabetical" | "newest";
}

/** Global Search (Module 09): title/author/category match + category/language filters + sort. */
export function searchBooks(books: Book[], query: string, filters: SearchFilters = {}): Book[] {
  const normalized = query.trim().toLowerCase();
  let results = books;

  if (normalized) {
    results = results.filter(
      (book) =>
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.categorySlug.toLowerCase().includes(normalized) ||
        book.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  }

  if (filters.categorySlug) {
    results = results.filter((book) => book.categorySlug === filters.categorySlug);
  }

  switch (filters.sort) {
    case "alphabetical":
      results = [...results].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "newest":
      results = [...results].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      break;
    default:
      break;
  }

  return results;
}
