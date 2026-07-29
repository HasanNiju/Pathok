"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Builds a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function getPageList(current: number, total: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const windowSize = 1;

  for (let page = 1; page <= total; page++) {
    const isEdge = page === 1 || page === total;
    const isNearCurrent = Math.abs(page - current) <= windowSize;

    if (isEdge || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const pages = getPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t("common.previous")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors duration-200",
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t("common.next")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
