"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  /** Navigates here when provided; otherwise falls back to real browser
   *  history (router.back()) — use an explicit href for pages reachable
   *  from more than one place, so "back" always lands somewhere useful. */
  href?: string;
  label?: string;
  className?: string;
}

/** Small, consistent "go back" affordance for drill-down pages (book
 *  details, admin sub-sections, etc.) that sit below the top-level nav. */
export function BackButton({ href, label, className }: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground",
        "transition-colors duration-200 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label ?? t("common.back")}
    </button>
  );
}
