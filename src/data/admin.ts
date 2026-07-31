import { books, getRecentlyAddedBooks } from "@/data/books";
import { categories } from "@/data/categories";
import { reviews } from "@/data/reviews";
import { comments } from "@/data/comments";
import type { Book } from "@/types/book";

/**
 * Dummy Statistics Cards data. Per the PRD there is no backend — every
 * number here is derived at read-time from seed data other modules already
 * own (books, categories, reviews, comments), rather than a fabricated API.
 */
export function getAdminStats() {
  const readerNames = new Set([
    ...reviews.map((review) => review.userName),
    ...comments.map((comment) => comment.userName),
  ]);

  return {
    totalBooks: books.length,
    totalCategories: categories.length,
    totalUsers: readerNames.size,
    totalReviews: reviews.length + comments.length,
  };
}

/** Most recently added titles, for the Overview's "Recent Books" list. */
export function getRecentBooksForAdmin(limit = 5): Book[] {
  return getRecentlyAddedBooks(limit);
}
