"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchBookmarks, addBookmarkRow, removeBookmarkRow } from "@/lib/supabase/progress-service";
import type { ReaderBookmark } from "@/types/reader";

/**
 * Saved page positions within one book (Module 08) — lets a person mark a
 * spot without leaving text-level commentary. Persisted in Supabase's
 * `bookmarks` table per user+book, so it follows the reader across devices.
 */
export function useReaderBookmarks(userId: string | undefined, bookId: string) {
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);

  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      return;
    }
    fetchBookmarks(createClient(), userId, bookId).then(setBookmarks);
  }, [userId, bookId]);

  const isBookmarked = useCallback(
    (chapterId: string, pageIndex: number) =>
      bookmarks.some((b) => b.chapterId === chapterId && b.pageIndex === pageIndex),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (chapterId: string, pageIndex: number, excerpt: string) => {
      if (!userId) return "unavailable" as const;
      const existing = bookmarks.find((b) => b.chapterId === chapterId && b.pageIndex === pageIndex);
      const supabase = createClient();

      if (existing) {
        await removeBookmarkRow(supabase, existing.id);
        setBookmarks((current) => current.filter((b) => b.id !== existing.id));
        return "removed" as const;
      }

      const bookmark = await addBookmarkRow(supabase, { userId, bookId, chapterId, pageIndex, excerpt });
      setBookmarks((current) => [bookmark, ...current]);
      return "added" as const;
    },
    [bookmarks, bookId, userId]
  );

  const removeBookmark = useCallback(async (id: string) => {
    await removeBookmarkRow(createClient(), id);
    setBookmarks((current) => current.filter((b) => b.id !== id));
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}
