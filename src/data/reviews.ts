import type { Review } from "@/types/book-details";
import reviewsJson from "./reviews.json";

/**
 * Seed reviews for the dummy catalog. Only some books have any (the rest
 * exercise the Reviews section's empty state, by design). User-submitted
 * reviews written in this browser are layered on top at read time by
 * useBookReviews — this file is the read-only seed data only.
 */
export const reviews: Review[] = reviewsJson as Review[];

export function getReviewsByBookId(bookId: string): Review[] {
  return reviews
    .filter((review) => review.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Star-count histogram (index 0 = one star … index 4 = five stars). */
export function getRatingBreakdown(bookReviews: Review[]): number[] {
  const breakdown = [0, 0, 0, 0, 0];
  for (const review of bookReviews) {
    const index = Math.min(5, Math.max(1, Math.round(review.rating))) - 1;
    breakdown[index] = (breakdown[index] ?? 0) + 1;
  }
  return breakdown;
}
