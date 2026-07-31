"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { STORAGE_KEYS } from "@/constants";
import { READER_STORAGE_KEYS } from "@/constants/reader";
import { ACHIEVEMENT_DEFINITIONS } from "@/constants/dashboard";
import { getContinueReading } from "@/data/reading-progress";
import { getBookById } from "@/data/books";
import type { Book } from "@/types/book";
import type { AchievementProgress, DashboardStats, ReadingHistoryEntry } from "@/types/dashboard";

interface StoredReaderSession {
  chapterId: string;
  pageIndex: number;
  minutesSpent: number;
  updatedAt: string;
}

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

/** Approximates a book's "current progress" purely from its Reader session,
 *  since the session store keeps position (chapter/page) rather than a
 *  ready-made percentage — deriving an exact figure would need the book's
 *  chapters, which the dashboard shouldn't have to load just to show a bar. */
function estimateProgressFromSession(minutesSpent: number, book: Book): number {
  if (book.readingMinutes <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((minutesSpent / book.readingMinutes) * 100)));
}

/**
 * Scans localStorage for every Reader session belonging to this user and
 * returns them keyed by bookId. This is the only place in the app that
 * needs the *set* of books someone has opened in the Reader — every other
 * consumer (use-reading-session) only ever looks at one book at a time.
 */
function readAllSessions(userId: string): Record<string, StoredReaderSession> {
  if (typeof window === "undefined") return {};

  const prefix = `${READER_STORAGE_KEYS.session}:${userId}:`;
  const sessions: Record<string, StoredReaderSession> = {};

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;

    const bookId = key.slice(prefix.length);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      sessions[bookId] = JSON.parse(raw) as StoredReaderSession;
    } catch {
      // Skip anything that failed to parse — best-effort read.
    }
  }

  return sessions;
}

/**
 * Aggregates everything the User Dashboard needs to render, sourced from
 * data other modules already own: seeded progress (Home), live Reader
 * sessions (Reader), and favorites/bookmarks (Book Details). No new
 * storage is introduced — this hook only reads and merges.
 */
export function useDashboard() {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Record<string, StoredReaderSession>>({});

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      setBookmarkIds([]);
      setSessions({});
      setIsHydrated(true);
      return;
    }

    setFavoriteIds(readIdList(`${STORAGE_KEYS.favoriteBooks}:${user.id}`));
    setBookmarkIds(readIdList(`${STORAGE_KEYS.bookmarkedBooks}:${user.id}`));
    setSessions(readAllSessions(user.id));
    setIsHydrated(true);
  }, [user]);

  const history = useMemo<ReadingHistoryEntry[]>(() => {
    if (!user) return [];

    const seedEntries = getContinueReading(user.id);
    const byBookId = new Map<string, ReadingHistoryEntry>();

    for (const entry of seedEntries) {
      byBookId.set(entry.bookId, {
        bookId: entry.bookId,
        progress: entry.progress,
        lastReadAt: entry.lastReadAt,
        isCompleted: entry.progress >= 100,
        isLive: false,
      });
    }

    for (const [bookId, session] of Object.entries(sessions)) {
      const book = getBookById(bookId);
      if (!book) continue;

      const progress = estimateProgressFromSession(session.minutesSpent, book);
      byBookId.set(bookId, {
        bookId,
        progress,
        lastReadAt: session.updatedAt,
        minutesSpent: session.minutesSpent,
        isCompleted: progress >= 100,
        isLive: true,
      });
    }

    return Array.from(byBookId.values()).sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
  }, [user, sessions]);

  const inProgress = useMemo(() => history.filter((entry) => !entry.isCompleted), [history]);
  const completed = useMemo(() => history.filter((entry) => entry.isCompleted), [history]);

  const favoriteBooks = useMemo(
    () => favoriteIds.map((id) => getBookById(id)).filter((book): book is Book => Boolean(book)),
    [favoriteIds]
  );

  const bookmarkedBooks = useMemo(
    () => bookmarkIds.map((id) => getBookById(id)).filter((book): book is Book => Boolean(book)),
    [bookmarkIds]
  );

  const stats = useMemo<DashboardStats>(() => {
    const categories = new Set<string>();
    let totalMinutes = 0;
    let progressSum = 0;

    for (const entry of history) {
      const book = getBookById(entry.bookId);
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
  }, [history, inProgress.length, completed.length, favoriteBooks.length, bookmarkedBooks.length]);

  const achievements = useMemo<AchievementProgress[]>(
    () =>
      ACHIEVEMENT_DEFINITIONS.map((definition) => {
        const currentValue = stats[definition.metric];
        return {
          ...definition,
          currentValue,
          isEarned: currentValue >= definition.target,
        };
      }),
    [stats]
  );

  return {
    isHydrated,
    history,
    inProgress,
    completed,
    favoriteBooks,
    bookmarkedBooks,
    stats,
    achievements,
  };
}
