import type { Review } from "@/types/book-details";

/** Star-count histogram (index 0 = one star … index 4 = five stars). */
export function getRatingBreakdown(bookReviews: Review[]): number[] {
  const breakdown = [0, 0, 0, 0, 0];
  for (const review of bookReviews) {
    const index = Math.min(5, Math.max(1, Math.round(review.rating))) - 1;
    breakdown[index] = (breakdown[index] ?? 0) + 1;
  }
  return breakdown;
}
