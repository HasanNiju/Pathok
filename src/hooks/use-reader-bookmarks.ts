"use client";

import { useCallback, useEffect, useState } from "react";
import { READER_STORAGE_KEYS } from "@/constants/reader";
import type { ReaderBookmark } from "@/types/reader";

function storageKey(userId: string | undefined, bookId: string) {
  return `${READER_STORAGE_KEYS.bookmarks}:${userId ?? "guest"}:${bookId}`;
}

function readAll(userId: string | undefined, bookId: string): ReaderBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId, bookId));
    return raw ? (JSON.parse(raw) as ReaderBookmark[]) : [];
  } catch {
    return [];
  }
}

/**
 * Saved page positions within one book — lets a person mark a spot
 * without leaving text-level commentary (see useReaderAnnotations for
 * highlights/notes). Persisted per user+book, same pattern as favorites.
 */
export function useReaderBookmarks(userId: string | undefined, bookId: string) {
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);

  useEffect(() => {
    setBookmarks(readAll(userId, bookId));
  }, [userId, bookId]);

  const persist = useCallback(
    (next: ReaderBookmark[]) => {
      setBookmarks(next);
      try {
        window.localStorage.setItem(storageKey(userId, bookId), JSON.stringify(next));
      } catch {
        // Best-effort persistence only.
      }
    },
    [userId, bookId]
  );

  const isBookmarked = useCallback(
    (chapterId: string, pageIndex: number) =>
      bookmarks.some((b) => b.chapterId === chapterId && b.pageIndex === pageIndex),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (chapterId: string, pageIndex: number, excerpt: string) => {
      const existing = bookmarks.find((b) => b.chapterId === chapterId && b.pageIndex === pageIndex);
      if (existing) {
        persist(bookmarks.filter((b) => b.id !== existing.id));
        return "removed" as const;
      }
      const bookmark: ReaderBookmark = {
        id: `bm-${Date.now()}`,
        bookId,
        chapterId,
        pageIndex,
        excerpt,
        createdAt: new Date().toISOString(),
      };
      persist([bookmark, ...bookmarks]);
      return "added" as const;
    },
    [bookmarks, bookId, persist]
  );

  const removeBookmark = useCallback(
    (id: string) => persist(bookmarks.filter((b) => b.id !== id)),
    [bookmarks, persist]
  );

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}
