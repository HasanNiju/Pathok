"use client";

import { useState } from "react";
import Link from "next/link";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface WriteReviewFormProps {
  canReview: boolean;
  onSubmit: (rating: number, comment: string) => void;
}

export function WriteReviewForm({ canReview, onSubmit }: WriteReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!canReview) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground">{t("bookDetails.reviews.loginPrompt")}</p>
        <Link href="/login">
          <Button variant="outline" size="sm">
            {t("auth.nav.login")}
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = () => {
    if (rating === 0 || !comment.trim()) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <p className="text-sm font-bold text-foreground">{t("bookDetails.reviews.writeTitle")}</p>
      <StarRating value={rating} interactive onChange={setRating} size="lg" />
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t("bookDetails.reviews.placeholder")}
        rows={3}
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={rating === 0 || !comment.trim()}
        className="w-fit"
      >
        {t("bookDetails.reviews.submit")}
      </Button>
    </div>
  );
}
