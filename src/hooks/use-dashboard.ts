"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBooks } from "@/hooks/use-books";
import { STORAGE_KEYS } from "@/constants";
import { ACHIEVEMENT_DEFINITIONS } from "@/constants/dashboard";
import { createClient } from "@/lib/supabase/client";
import { fetchReadingProgressForUser } from "@/lib/supabase/progress-service";
import { fetchFavoriteBookIds } from "@/lib/supabase/favorites-service";
import { getBookById } from "@/lib/books";
import type { Book } from "@/types/book";
import type { AchievementProgress, DashboardStats, ReadingHistoryEntry } from "@/types/dashboard";

function readIdList(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Aggregates everything the User Dashboard needs, sourced from Supabase's
 * reading_progress + favorites tables (Modules 07/08) plus the shared book
 * catalog (Module 01). Quick-bookmarked books remain a lightweight
 * localStorage convenience (see use-book-interactions) distinct from the
 * Reader's in-book position bookmarks.
 */
export function useDashboard() {
  const { user } = useAuth();
  const { books, isLoading: booksLoading } = useBooks();
  const [isHydrated, setIsHydrated] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      setBookmarkIds([]);
      setHistory([]);
      setIsHydrated(true);
      return;
    }

    setBookmarkIds(readIdList(`${STORAGE_KEYS.bookmarkedBooks}:${user.id}`));

    const supabase = createClient();
    Promise.all([fetchReadingProgressForUser(supabase, user.id), fetchFavoriteBookIds(supabase, user.id)]).then(
      ([progressEntries, favIds]) => {
        setFavoriteIds(favIds);
        setHistory(
          progressEntries.map((entry) => ({
            bookId: entry.bookId,
            progress: entry.progress,
            lastReadAt: entry.lastReadAt,
            minutesSpent: entry.minutesSpent,
            isCompleted: entry.progress >= 100,
            isLive: true,
          }))
        );
        setIsHydrated(true);
      }
    );
  }, [user]);

  const inProgress = useMemo(() => history.filter((entry) => !entry.isCompleted), [history]);
  const completed = useMemo(() => history.filter((entry) => entry.isCompleted), [history]);

  const favoriteBooks = useMemo(
    () => favoriteIds.map((id) => getBookById(books, id)).filter((book): book is Book => Boolean(book)),
    [favoriteIds, books]
  );

  const bookmarkedBooks = useMemo(
    () => bookmarkIds.map((id) => getBookById(books, id)).filter((book): book is Book => Boolean(book)),
    [bookmarkIds, books]
  );

  const stats = useMemo<DashboardStats>(() => {
    const categories = new Set<string>();
    let totalMinutes = 0;
    let progressSum = 0;

    for (const entry of history) {
      const book = getBookById(books, entry.bookId);
      if (book) categories.add(book.categorySlug);
      totalMinutes += entry.minutesSpent ?? Math.round((entry.progress / 100) * (book?.readingMinutes ?? 0));
      progressSum += entry.progress;
    }

    return {
      booksStarted: history.length,
      booksInProgress: inProgress.length,
      booksCompleted: completed.length,
      favoritesCount: favoriteBooks.length,
      bookmarksCount: bookmarkedBooks.length,
      totalMinutes,
      categoriesExplored: categories.size,
      averageProgress: history.length > 0 ? Math.round(progressSum / history.length) : 0,
    };
  }, [history, inProgress.length, completed.length, favoriteBooks.length, bookmarkedBooks.length, books]);

  const achievements = useMemo<AchievementProgress[]>(
    () =>
      ACHIEVEMENT_DEFINITIONS.map((definition) => {
        const currentValue = stats[definition.metric];
        return { ...definition, currentValue, isEarned: currentValue >= definition.target };
      }),
    [stats]
  );

  return {
    isHydrated: isHydrated && !booksLoading,
    books,
    history,
    inProgress,
    completed,
    favoriteBooks,
    bookmarkedBooks,
    stats,
    achievements,
  };
}
