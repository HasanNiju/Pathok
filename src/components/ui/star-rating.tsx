"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  /** 0–5, decimals allowed in read-only mode (renders partial fill). */
  value: number;
  /** Renders as a set of clickable buttons and calls onChange instead of just displaying. */
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
} as const;

/**
 * Five-star rating — read-only (book cards, review lists, rating summary)
 * or interactive (the "write a review" form). Read-only mode renders
 * partial fills for decimal averages (e.g. 4.6); interactive mode only
 * ever reports whole stars, since that's what a reviewer picks.
 */
export function StarRating({ value, interactive, onChange, size = "md", className }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sizeClass = SIZE_CLASSES[size];

  if (!interactive) {
    return (
      <div className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} / 5`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercent = Math.max(0, Math.min(1, value - (star - 1))) * 100;
          return (
            <span key={star} className={cn("relative inline-block", sizeClass)}>
              <Star className={cn(sizeClass, "absolute inset-0 text-muted-foreground/30")} aria-hidden="true" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star className={cn(sizeClass, "fill-primary text-primary")} aria-hidden="true" />
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  const displayValue = hovered ?? value;

  return (
    <div className={cn("inline-flex items-center gap-1", className)} onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          aria-label={`${star} / 5`}
          className="rounded-sm transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              sizeClass,
              star <= displayValue ? "fill-primary text-primary" : "text-muted-foreground/30"
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
