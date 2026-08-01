"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { fetchFavoriteBookIds, toggleFavoriteRow } from "@/lib/supabase/favorites-service";
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
 * Favorite (Supabase-backed, syncs across devices) + quick-bookmark
 * (localStorage, a lightweight per-device "save for later" toggle distinct
 * from the Reader's in-book position bookmarks — see use-reader-bookmarks)
 * state for a single book.
 */
export function useBookInteractions(bookId: string) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const bookmarkKey = user ? `${STORAGE_KEYS.bookmarkedBooks}:${user.id}` : null;

  useEffect(() => {
    setBookmarkedIds(bookmarkKey ? readIds(bookmarkKey) : []);
  }, [bookmarkKey]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }
    fetchFavoriteBookIds(createClient(), user.id).then(setFavoriteIds);
  }, [user]);

  const requireAuth = useCallback(() => {
    addToast({ title: t("bookDetails.actions.loginRequired") });
  }, [addToast, t]);

  const toggleFavorite = useCallback(async () => {
    if (!user) return requireAuth();
    const isFavorite = favoriteIds.includes(bookId);

    try {
      await toggleFavoriteRow(createClient(), user.id, bookId, isFavorite);
      setFavoriteIds((current) => (isFavorite ? current.filter((id) => id !== bookId) : [...current, bookId]));
      addToast({
        title: isFavorite ? t("bookDetails.actions.removedFromFavorites") : t("bookDetails.actions.addedToFavorites"),
      });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  }, [user, favoriteIds, bookId, requireAuth, addToast, t]);

  const toggleBookmark = useCallback(() => {
    if (!bookmarkKey) return requireAuth();

    setBookmarkedIds((current) => {
      const isBookmarked = current.includes(bookId);
      const next = isBookmarked ? current.filter((id) => id !== bookId) : [...current, bookId];
      writeIds(bookmarkKey, next);
      addToast({
        title: isBookmarked ? t("bookDetails.actions.removedBookmark") : t("bookDetails.actions.addedBookmark"),
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
