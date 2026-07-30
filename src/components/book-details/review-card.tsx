"use client";

import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import type { Review } from "@/types/book-details";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex gap-3 border-b border-border py-5 last:border-b-0">
      <Avatar name={review.userName} src={review.userAvatarUrl} size="md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-bold text-foreground">{review.userName}</span>
          <span className="text-xs text-muted-foreground">{review.createdAt}</span>
        </div>
        <StarRating value={review.rating} size="sm" />
        <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
      </div>
    </div>
  );
}
