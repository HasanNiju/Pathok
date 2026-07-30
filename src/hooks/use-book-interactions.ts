"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { STORAGE_KEYS } from "@/constants";

function readIds(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(storageKey: string, ids: string[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(ids));
}

/**
 * Favorite + bookmark state for a single book, scoped to the signed-in
 * user and persisted in localStorage (per the PRD, there's no backend —
 * this is the same "no fake APIs" mock-persistence pattern mockAuth uses
 * for sessions). Guests can see the buttons but toggling prompts a toast
 * instead of silently doing nothing, same spirit as the Continue Reading
 * empty state gating on auth.
 */
export function useBookInteractions(bookId: string) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const favoriteKey = user ? `${STORAGE_KEYS.favoriteBooks}:${user.id}` : null;
  const bookmarkKey = user ? `${STORAGE_KEYS.bookmarkedBooks}:${user.id}` : null;

  useEffect(() => {
    setFavoriteIds(favoriteKey ? readIds(favoriteKey) : []);
    setBookmarkedIds(bookmarkKey ? readIds(bookmarkKey) : []);
  }, [favoriteKey, bookmarkKey]);

  const requireAuth = useCallback(() => {
    addToast({ title: t("bookDetails.actions.loginRequired") });
  }, [addToast, t]);

  const toggleFavorite = useCallback(() => {
    if (!favoriteKey) return requireAuth();

    setFavoriteIds((current) => {
      const isFavorite = current.includes(bookId);
      const next = isFavorite ? current.filter((id) => id !== bookId) : [...current, bookId];
      writeIds(favoriteKey, next);
      addToast({
        title: isFavorite
          ? t("bookDetails.actions.removedFromFavorites")
          : t("bookDetails.actions.addedToFavorites"),
      });
      return next;
    });
  }, [favoriteKey, bookId, requireAuth, addToast, t]);

  const toggleBookmark = useCallback(() => {
    if (!bookmarkKey) return requireAuth();

    setBookmarkedIds((current) => {
      const isBookmarked = current.includes(bookId);
      const next = isBookmarked ? current.filter((id) => id !== bookId) : [...current, bookId];
      writeIds(bookmarkKey, next);
      addToast({
        title: isBookmarked
          ? t("bookDetails.actions.removedBookmark")
          : t("bookDetails.actions.addedBookmark"),
      });
      return next;
    });
  }, [bookmarkKey, bookId, requireAuth, addToast, t]);

  return {
    isFavorite: favoriteIds.includes(bookId),
    isBookmarked: bookmarkedIds.includes(bookId),
    toggleFavorite,
    toggleBookmark,
  };
}
