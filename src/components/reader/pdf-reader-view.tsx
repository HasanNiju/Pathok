"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useReaderBookmarks } from "@/hooks/use-reader-bookmarks";
import { createClient } from "@/lib/supabase/client";
import { fetchProgressForBook, saveReadingProgress } from "@/lib/supabase/progress-service";
import { PdfBookReader } from "@/components/reader/pdf-book-reader";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/book";

/** chapterId used for every reading_progress/bookmark row created from the
 *  native PDF reader — there are no real chapters, just page numbers. */
const PDF_POSITION_KEY = "pdf";

interface PdfReaderViewProps {
  book: Book;
}

/**
 * Chrome around the native PDF viewer, styled to match the app's premium
 * typography Reader (warm/dark theme background, centered title, floating
 * chevron navigation, quiet page indicator) — while the pages themselves
 * stay an untouched, pixel-faithful render of the source PDF.
 */
export function PdfReaderView({ book }: PdfReaderViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);
  const { isBookmarked, toggleBookmark } = useReaderBookmarks(user?.id, book.id);

  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(800);
  const [availableHeight, setAvailableHeight] = useState(900);
  const [isHydrated, setIsHydrated] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  // Resume from wherever this reader last left off.
  useEffect(() => {
    if (!user) {
      setIsHydrated(true);
      return;
    }
    fetchProgressForBook(createClient(), user.id, book.id).then((saved) => {
      if (saved?.chapterId === PDF_POSITION_KEY && saved.pageIndex) setPageNumber(saved.pageIndex);
      setIsHydrated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, book.id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      setAvailableWidth(Math.max(280, (rect?.width ?? el.clientWidth) - 96));
      setAvailableHeight(Math.max(400, (rect?.height ?? el.clientHeight) - 160));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const step = isDesktop ? 2 : 1;

  const persistProgress = useCallback(
    (page: number) => {
      if (!user || !numPages) return;
      saveReadingProgress(createClient(), {
        userId: user.id,
        bookId: book.id,
        chapterId: PDF_POSITION_KEY,
        pageIndex: page,
        progress: Math.min(100, Math.round((page / numPages) * 100)),
        minutesSpent: 0,
      }).catch(() => {});
    },
    [user, book.id, numPages]
  );

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(numPages || next, next));
      setPageNumber(clamped);
      scrollRef.current?.scrollTo({ top: 0 });
      persistProgress(clamped);
    },
    [numPages, persistProgress]
  );

  const canGoPrev = pageNumber > 1;
  const canGoNext = numPages > 0 && pageNumber + step - 1 < numPages;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && canGoPrev) goTo(pageNumber - step);
      if (event.key === "ArrowRight" && canGoNext) goTo(pageNumber + step);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pageNumber, step, canGoPrev, canGoNext, goTo]);

  const handleToggleBookmark = async () => {
    if (!user) {
      addToast({ title: t("bookDetails.actions.loginRequired") });
      return;
    }
    const result = await toggleBookmark(PDF_POSITION_KEY, pageNumber, `Page ${pageNumber}`);
    addToast({
      title: result === "added" ? t("reader.actions.bookmarkAdded") : t("reader.actions.bookmarkRemoved"),
      variant: "success",
    });
  };

  if (!isHydrated) return null;

  const pageLabel =
    numPages > 0
      ? isDesktop && pageNumber + 1 <= numPages
        ? t("reader.pdf.spreadOf")
            .replace("{start}", String(pageNumber))
            .replace("{end}", String(pageNumber + 1))
            .replace("{total}", String(numPages))
        : t("reader.pdf.pageOf").replace("{page}", String(pageNumber)).replace("{total}", String(numPages))
      : "";

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header — quiet, centered title, matches the typography Reader's chrome */}
      <AnimatePresence>
        {chromeVisible && (
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/95 px-4 py-3.5 backdrop-blur sm:px-6"
          >
            <button
              type="button"
              onClick={() => router.push(`/books/${book.id}`)}
              aria-label={t("common.back")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <p className="min-w-0 flex-1 truncate text-center text-base font-bold tracking-tight text-foreground sm:text-lg">
              {book.title}
            </p>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleToggleBookmark}
                aria-label={
                  isBookmarked(PDF_POSITION_KEY, pageNumber)
                    ? t("reader.actions.removeBookmark")
                    : t("reader.actions.addBookmark")
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              >
                {isBookmarked(PDF_POSITION_KEY, pageNumber) ? (
                  <BookmarkCheck className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? t("reader.actions.exitFullscreen") : t("reader.actions.fullscreen")}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground sm:inline-flex"
              >
                {isFullscreen ? (
                  <Minimize className="h-[18px] w-[18px]" aria-hidden="true" />
                ) : (
                  <Maximize className="h-[18px] w-[18px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Reading area — floating chevrons at the page edges, like a book laid open on a table */}
      <div
        ref={scrollRef}
        onClick={() => setChromeVisible((visible) => !visible)}
        className="relative flex-1 overflow-y-auto px-3 py-8 sm:px-6"
      >
        <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goTo(pageNumber - step);
            }}
            disabled={!canGoPrev}
            aria-label={t("common.previous")}
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "border border-border/60 bg-card text-foreground shadow-soft transition-all duration-200",
              "hover:bg-secondary disabled:pointer-events-none disabled:opacity-0"
            )}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <PdfBookReader
            fileUrl={book.fileUrl ?? ""}
            pageNumber={pageNumber}
            availableWidth={availableWidth}
            availableHeight={availableHeight}
            onLoadSuccess={(total) => setNumPages(total)}
          />

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goTo(pageNumber + step);
            }}
            disabled={!canGoNext}
            aria-label={t("common.next")}
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "border border-border/60 bg-card text-foreground shadow-soft transition-all duration-200",
              "hover:bg-secondary disabled:pointer-events-none disabled:opacity-0"
            )}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Quiet page indicator, matching the typography Reader's footer style */}
      <div className="shrink-0 border-t border-border/60 bg-background/95 py-3 text-center backdrop-blur">
        <p className="text-sm text-muted-foreground">{pageLabel}</p>
      </div>
    </div>
  );
}
