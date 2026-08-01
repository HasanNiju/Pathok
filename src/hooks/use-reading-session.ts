"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchProgressForBook, saveReadingProgress } from "@/lib/supabase/progress-service";
import type { Chapter, ReadingSession } from "@/types/reader";

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
 * derived overall progress percentage — and persists it to Supabase's
 * reading_progress table per user+book (Module 07), so returning to the
 * book resumes exactly where they left off, on any device. Also accumulates
 * minutes spent reading, shown in the progress panel and Dashboard.
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

  const supabaseRef = useRef(createClient());

  const progressOf = useCallback(
    (chId: string, pIndex: number, pagesInChapter: number) => {
      if (totalParagraphs === 0) return 0;
      const before = paragraphsBefore(chapters, chId);
      const chapter = chapters.find((c) => c.id === chId);
      const chapterParagraphs = chapter?.paragraphs.length ?? 0;
      const fractionOfChapter = pagesInChapter > 1 ? pIndex / (pagesInChapter - 1) : pIndex > 0 ? 1 : 0;
      const paragraphsInto = before + fractionOfChapter * chapterParagraphs;
      return Math.max(0, Math.min(100, Math.round((paragraphsInto / totalParagraphs) * 100)));
    },
    [chapters, totalParagraphs]
  );

  // Load any saved position once on mount / when switching books.
  useEffect(() => {
    let active = true;
    if (!userId) {
      setChapterIdState(chapters[0]?.id ?? "");
      setPageIndexState(0);
      setIsHydrated(true);
      return;
    }

    fetchProgressForBook(supabaseRef.current, userId, bookId).then((saved) => {
      if (!active) return;
      if (saved && saved.chapterId && chapters.some((c) => c.id === saved.chapterId)) {
        setChapterIdState(saved.chapterId);
        setPageIndexState(saved.pageIndex ?? 0);
        setMinutesSpent(saved.minutesSpent ?? 0);
      } else {
        setChapterIdState(chapters[0]?.id ?? "");
        setPageIndexState(0);
      }
      setIsHydrated(true);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bookId]);

  const persist = useCallback(
    (nextChapterId: string, nextPageIndex: number, nextMinutes: number, pagesInChapter: number) => {
      if (!userId) return;
      saveReadingProgress(supabaseRef.current, {
        userId,
        bookId,
        progress: progressOf(nextChapterId, nextPageIndex, pagesInChapter),
        chapterId: nextChapterId,
        pageIndex: nextPageIndex,
        minutesSpent: nextMinutes,
      }).catch(() => {
        // Best-effort — a failed save shouldn't interrupt reading.
      });
    },
    [userId, bookId, progressOf]
  );

  const setChapterId = useCallback(
    (id: string, page = 0) => {
      setChapterIdState(id);
      setPageIndexState(page);
      persist(id, page, minutesSpent, totalPagesInChapter);
    },
    [persist, minutesSpent, totalPagesInChapter]
  );

  const setPageIndex = useCallback(
    (page: number) => {
      setPageIndexState(page);
      persist(chapterId, page, minutesSpent, totalPagesInChapter);
    },
    [persist, chapterId, minutesSpent, totalPagesInChapter]
  );

  // Accrue reading minutes in the background while the tab is visible.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setMinutesSpent((prev) => {
        const next = prev + 1;
        persist(chapterId, pageIndex, next, totalPagesInChapter);
        return next;
      });
    }, 60_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bookId, chapterId, pageIndex, totalPagesInChapter]);

  const progress = useMemo(
    () => progressOf(chapterId, pageIndex, totalPagesInChapter),
    [progressOf, chapterId, pageIndex, totalPagesInChapter]
  );

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
