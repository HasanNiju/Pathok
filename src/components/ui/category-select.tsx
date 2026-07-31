"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export interface CategorySelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
}

/**
 * Category picker for book creation/upload — per the PRD, "Book creation
 * must select from existing categories" rather than a free-typed field.
 * Reads live data through useCategories(), so anything created, renamed,
 * or deactivated in Category Management is reflected immediately; inactive
 * categories are excluded so a book can't be filed under a hidden genre.
 */
export const CategorySelect = forwardRef<HTMLSelectElement, CategorySelectProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const { activeCategories } = useCategories();
    const { language, t } = useTranslation();
    const selectId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground",
            "transition-colors duration-200 ease-soft",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          <option value="" disabled>
            {t("admin.categories.select.placeholder")}
          </option>
          {activeCategories.map((category) => (
            <option key={category.id} value={category.slug}>
              {language === "bn" ? category.nameBn : category.name}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
CategorySelect.displayName = "CategorySelect";
