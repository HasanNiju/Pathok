"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { READER_STORAGE_KEYS } from "@/constants/reader";
import type { Chapter, ReadingSession } from "@/types/reader";

interface StoredSession {
  chapterId: string;
  pageIndex: number;
  minutesSpent: number;
  updatedAt: string;
}

function storageKey(userId: string | undefined, bookId: string) {
  return `${READER_STORAGE_KEYS.session}:${userId ?? "guest"}:${bookId}`;
}

function readSession(userId: string | undefined, bookId: string): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(userId, bookId));
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

/** How many paragraphs come strictly before this chapter, in reading order —
 *  used as a stable proxy for "how far into the book" a chapter starts. */
function paragraphsBefore(chapters: Chapter[], chapterId: string): number {
  let count = 0;
  for (const chapter of chapters) {
    if (chapter.id === chapterId) break;
    count += chapter.paragraphs.length;
  }
  return count;
}

/**
 * Tracks where a person is in a book — chapter, in-chapter page, and a
 * derived overall progress percentage — and persists it locally per
 * user+book so returning to the book resumes exactly where they left off.
 * Also accumulates minutes spent reading, shown in the progress panel.
 */
export function useReadingSession(userId: string | undefined, bookId: string, chapters: Chapter[]) {
  const totalParagraphs = useMemo(
    () => chapters.reduce((sum, c) => sum + c.paragraphs.length, 0),
    [chapters]
  );

  const [chapterId, setChapterIdState] = useState<string>(chapters[0]?.id ?? "");
  const [pageIndex, setPageIndexState] = useState(0);
  const [totalPagesInChapter, setTotalPagesInChapter] = useState(1);
  const [minutesSpent, setMinutesSpent] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const sessionStartRef = useRef<number>(Date.now());

  // Load any saved position once on mount / when switching books.
  useEffect(() => {
    const saved = readSession(userId, bookId);
    if (saved && chapters.some((c) => c.id === saved.chapterId)) {
      setChapterIdState(saved.chapterId);
      setPageIndexState(saved.pageIndex);
      setMinutesSpent(saved.minutesSpent);
    } else {
      setChapterIdState(chapters[0]?.id ?? "");
      setPageIndexState(0);
    }
    sessionStartRef.current = Date.now();
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bookId]);

  const persist = useCallback(
    (next: Partial<StoredSession>) => {
      const current: StoredSession = {
        chapterId,
        pageIndex,
        minutesSpent,
        updatedAt: new Date().toISOString(),
        ...next,
      };
      try {
        window.localStorage.setItem(storageKey(userId, bookId), JSON.stringify(current));
      } catch {
        // Best-effort persistence only.
      }
    },
    [userId, bookId, chapterId, pageIndex, minutesSpent]
  );

  const setChapterId = useCallback(
    (id: string, page = 0) => {
      setChapterIdState(id);
      setPageIndexState(page);
      persist({ chapterId: id, pageIndex: page });
    },
    [persist]
  );

  const setPageIndex = useCallback(
    (page: number) => {
      setPageIndexState(page);
      persist({ pageIndex: page });
    },
    [persist]
  );

  // Accrue reading minutes in the background while the tab is visible.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setMinutesSpent((prev) => {
        const next = prev + 1;
        persist({ minutesSpent: next });
        return next;
      });
    }, 60_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bookId]);

  const progress = useMemo<number>(() => {
    if (totalParagraphs === 0) return 0;
    const before = paragraphsBefore(chapters, chapterId);
    const chapter = chapters.find((c) => c.id === chapterId);
    const chapterParagraphs = chapter?.paragraphs.length ?? 0;
    const fractionOfChapter =
      totalPagesInChapter > 1 ? pageIndex / (totalPagesInChapter - 1) : pageIndex > 0 ? 1 : 0;
    const paragraphsInto = before + fractionOfChapter * chapterParagraphs;
    return Math.max(0, Math.min(100, Math.round((paragraphsInto / totalParagraphs) * 100)));
  }, [chapters, chapterId, pageIndex, totalPagesInChapter, totalParagraphs]);

  const session: ReadingSession = {
    bookId,
    chapterId,
    pageIndex,
    progress,
    minutesSpent,
    updatedAt: new Date().toISOString(),
  };

  return {
    session,
    chapterId,
    pageIndex,
    totalPagesInChapter,
    setTotalPagesInChapter,
    setChapterId,
    setPageIndex,
    progress,
    minutesSpent,
    isHydrated,
  };
}
