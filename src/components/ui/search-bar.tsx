"use client";

import { Search, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder, className }: SearchBarProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("common.searchPlaceholder");

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={resolvedPlaceholder}
        aria-label={resolvedPlaceholder}
        className={cn(
          "h-11 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm text-foreground",
          "placeholder:text-muted-foreground transition-colors duration-200 ease-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("common.clear")}
          className="absolute right-3 text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
