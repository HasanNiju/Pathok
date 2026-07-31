import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Language } from "@/types";

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 * Used by every component instead of hand-concatenating className strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Locale-aware short date, matching the pattern book-hero.tsx already uses
 * for publishedAt — centralized here so the Dashboard module (and anything
 * after it) doesn't re-derive the locale string on its own.
 */
export function formatDate(iso: string, language: Language, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}
