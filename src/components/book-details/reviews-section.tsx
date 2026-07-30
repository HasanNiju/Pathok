"use client";

import { MessageSquareText } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { RatingSummary } from "@/components/book-details/rating-summary";
import { WriteReviewForm } from "@/components/book-details/write-review-form";
import { ReviewCard } from "@/components/book-details/review-card";
import { useTranslation } from "@/hooks/use-translation";
import { useBookReviews } from "@/hooks/use-book-reviews";
import type { Book } from "@/types/book";

export function ReviewsSection({ book }: { book: Book }) {
  const { t } = useTranslation();
  const { reviews, submitReview, canReview } = useBookReviews(book.id);

  return (
    <section id="reviews" className="scroll-mt-24">
      <SectionHeader title={t("bookDetails.reviews.title")} subtitle={t("bookDetails.reviews.subtitle")} />

      <div className="flex flex-col gap-6">
        <RatingSummary fallbackRating={book.rating} reviews={reviews} />
        <WriteReviewForm canReview={canReview} onSubmit={submitReview} />

        {reviews.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText className="h-5 w-5" aria-hidden="true" />}
            title={t("bookDetails.reviews.emptyTitle")}
            description={t("bookDetails.reviews.emptyDescription")}
          />
        ) : (
          <div className="rounded-xl border border-border px-5 sm:px-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
