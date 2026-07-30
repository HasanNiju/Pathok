"use client";

import { StarRating } from "@/components/ui/star-rating";
import { useTranslation } from "@/hooks/use-translation";
import { getRatingBreakdown } from "@/data/reviews";
import type { Review } from "@/types/book-details";

interface RatingSummaryProps {
  fallbackRating: number;
  reviews: Review[];
}

/**
 * Shows the review-derived average when reviews exist, falling back to the
 * catalog's aggregate rating (book.rating) when this book has none yet —
 * so the number is never blank even before anyone has reviewed it.
 */
export function RatingSummary({ fallbackRating, reviews }: RatingSummaryProps) {
  const { t } = useTranslation();
  const breakdown = getRatingBreakdown(reviews);
  const total = reviews.length;
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : fallbackRating;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center gap-1 sm:items-start">
        <span className="text-4xl font-bold tracking-tight text-foreground">{average.toFixed(1)}</span>
        <StarRating value={average} size="sm" />
        <span className="text-xs text-muted-foreground">
          {t("bookDetails.reviews.count").replace("{count}", String(total))}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = breakdown[stars - 1] ?? 0;
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 shrink-0 text-right">{stars}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
