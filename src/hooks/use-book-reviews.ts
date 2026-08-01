"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { fetchReviews, submitReviewRow } from "@/lib/supabase/reviews-service";
import type { Review } from "@/types/book-details";

/**
 * Reviews for a single book — fetched from and written to Supabase's
 * `reviews` table. New reviews from the current user, once submitted,
 * appear immediately without a page reload.
 */
export function useBookReviews(bookId: string) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews(createClient(), bookId).then(setReviews);
  }, [bookId]);

  const submitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!user) {
        addToast({ title: t("bookDetails.actions.loginRequired") });
        return;
      }
      if (!comment.trim()) return;

      try {
        await submitReviewRow(createClient(), { bookId, userId: user.id, rating, comment: comment.trim() });
        setReviews((current) => [
          {
            id: crypto.randomUUID(),
            bookId,
            userName: user.name,
            userAvatarUrl: user.avatarUrl,
            rating,
            comment: comment.trim(),
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...current,
        ]);
        addToast({ title: t("bookDetails.reviews.submitSuccess") });
      } catch {
        addToast({ title: t("common.error"), variant: "error" });
      }
    },
    [user, bookId, addToast, t]
  );

  return { reviews, submitReview, canReview: Boolean(user) };
}
