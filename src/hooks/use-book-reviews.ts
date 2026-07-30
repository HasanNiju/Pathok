"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { STORAGE_KEYS } from "@/constants";
import { getReviewsByBookId } from "@/data/reviews";
import type { Review } from "@/types/book-details";

function readLocalReviews(storageKey: string): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

/**
 * Reviews for a single book: the dummy seed data plus anything the
 * current browser has submitted, persisted in localStorage per bookId
 * (there's no backend per the PRD, so this is the mock write path —
 * same pattern as useBookInteractions). New reviews from the current
 * user, once submitted, appear immediately without a page reload.
 */
export function useBookReviews(bookId: string) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const storageKey = `${STORAGE_KEYS.userReviews}:${bookId}`;
  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  useEffect(() => {
    setLocalReviews(readLocalReviews(storageKey));
  }, [storageKey]);

  const submitReview = useCallback(
    (rating: number, comment: string) => {
      if (!user) {
        addToast({ title: t("bookDetails.actions.loginRequired") });
        return;
      }
      if (!comment.trim()) return;

      const review: Review = {
        id: crypto.randomUUID(),
        bookId,
        userName: user.name,
        userAvatarUrl: user.avatarUrl,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setLocalReviews((current) => {
        const next = [review, ...current];
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });

      addToast({ title: t("bookDetails.reviews.submitSuccess") });
    },
    [user, bookId, storageKey, addToast, t]
  );

  const reviews = [...localReviews, ...getReviewsByBookId(bookId)];

  return { reviews, submitReview, canReview: Boolean(user) };
}
