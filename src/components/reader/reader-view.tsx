"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useReaderSettings } from "@/hooks/use-reader-settings";
import { useReadingSession } from "@/hooks/use-reading-session";
import { useReaderBookmarks } from "@/hooks/use-reader-bookmarks";
import { useReaderAnnotations } from "@/hooks/use-reader-annotations";
import { useReaderSearch } from "@/hooks/use-reader-search";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { READER_THEMES } from "@/constants/reader";
import { ReaderContent, type ReaderContentHandle, type TextSelectionInfo } from "@/components/reader/reader-content";
import { ReaderTopBar } from "@/components/reader/reader-topbar";
import { ReaderBottomBar } from "@/components/reader/reader-bottombar";
import { SelectionToolbar } from "@/components/reader/selection-toolbar";
import { TocPanel } from "@/components/reader/toc-panel";
import { SettingsPanel } from "@/components/reader/settings-panel";
import { SearchPanel } from "@/components/reader/search-panel";
import { AnnotationsPanel } from "@/components/reader/annotations-panel";
import type { Book } from "@/types/book";
import type {
  AnnotationColor,
  BookContent,
  ReaderAnnotation,
  ReaderBookmark,
  ReaderSearchResult,
} from "@/types/reader";

type PanelName = "toc" | "settings" | "search" | "annotations" | null;

interface ReaderViewProps {
  book: Book;
  content: BookContent;
}

export function ReaderView({ book, content }: ReaderViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const chapters = useMemo(() => [...content.chapters].sort((a, b) => a.order - b.order), [content.chapters]);

  const { settings, update, increaseFontSize, decreaseFontSize, reset } = useReaderSettings();
  const {
    chapterId,
    pageIndex,
    totalPagesInChapter,
    setTotalPagesInChapter,
    setChapterId,
    setPageIndex,
    progress,
    minutesSpent,
  } = useReadingSession(user?.id, book.id, chapters);
  const { bookmarks, isBookmarked, toggleBookmark, removeBookmark } = useReaderBookmarks(user?.id, book.id);
  const { annotations, addAnnotation, updateAnnotationNote, removeAnnotation } = useReaderAnnotations(
    user?.id,
    book.id
  );
  const { query, setQuery, results } = useReaderSearch(chapters);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<ReaderContentHandle>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);

  const [chromeVisible, setChromeVisible] = useState(true);
  const [panel, setPanel] = useState<PanelName>(null);
  const [selection, setSelection] = useState<TextSelectionInfo | null>(null);
  const [pendingGoToLastPage, setPendingGoToLastPage] = useState(false);
  const [pendingParagraphJump, setPendingParagraphJump] = useState<number | null>(null);

  const currentChapter = chapters.find((c) => c.id === chapterId) ?? chapters[0];
  const currentChapterIndex = chapters.findIndex((c) => c.id === currentChapter?.id);
  const theme = READER_THEMES[settings.theme];
  const isDarkChrome = settings.theme === "dark" || settings.theme === "night";

  const chromeColors = {
    chrome: theme.chrome,
    border: theme.chromeBorder,
    fg: theme.fg,
    muted: theme.muted,
    accent: isDarkChrome ? theme.fg : "#3B82F6",
  };

  // Resolve a "go to last page of this chapter" request once its page count is known.
  useEffect(() => {
    if (pendingGoToLastPage) {
      setPageIndex(Math.max(0, totalPagesInChapter - 1));
      setPendingGoToLastPage(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPagesInChapter, pendingGoToLastPage]);

  // Resolve a search jump to an exact paragraph once the new chapter has laid out.
  useEffect(() => {
    if (pendingParagraphJump === null) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const page = contentRef.current?.getPageForParagraph(pendingParagraphJump) ?? 0;
        setPageIndex(page);
        setPendingParagraphJump(null);
      });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingParagraphJump, chapterId]);

  const turnPage = useCallback(
    (delta: number) => {
      const next = pageIndex + delta;
      if (next >= 0 && next < totalPagesInChapter) {
        setPageIndex(next);
        return;
      }
      if (delta > 0) {
        const nextChapter = chapters[currentChapterIndex + 1];
        if (nextChapter) {
          setChapterId(nextChapter.id, 0);
        } else {
          addToast({ title: t("reader.nav.endOfBook"), variant: "default" });
        }
      } else {
        const prevChapter = chapters[currentChapterIndex - 1];
        if (prevChapter) {
          setPendingGoToLastPage(true);
          setChapterId(prevChapter.id, 0);
        } else {
          addToast({ title: t("reader.nav.startOfBook"), variant: "default" });
        }
      }
    },
    [pageIndex, totalPagesInChapter, chapters, currentChapterIndex, setChapterId, setPageIndex, addToast, t]
  );

  // Keyboard navigation — arrow keys / space, like a native e-reader.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (panel) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        turnPage(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        turnPage(-1);
      } else if (event.key === "Escape" && isFullscreen) {
        toggleFullscreen();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [turnPage, panel, isFullscreen, toggleFullscreen]);

  // Swipe navigation on touch devices.
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      turnPage(deltaX < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  const handleContentTap = () => {
    if (!selection) setChromeVisible((v) => !v);
  };

  const handleToggleBookmark = () => {
    const excerpt = contentRef.current?.getFirstParagraphOnPage(pageIndex)?.text ?? currentChapter?.title ?? "";
    const result = toggleBookmark(chapterId, pageIndex, excerpt);
    addToast({
      title: result === "added" ? t("reader.actions.bookmarkAdded") : t("reader.actions.bookmarkRemoved"),
      variant: "success",
    });
  };

  const handleSelectResult = (result: ReaderSearchResult) => {
    if (result.chapterId !== chapterId) {
      setChapterId(result.chapterId, 0);
    }
    setPendingParagraphJump(result.paragraphIndex);
  };

  const handleSelectBookmark = (bookmark: ReaderBookmark) => {
    setChapterId(bookmark.chapterId, bookmark.pageIndex);
  };

  const handleSelectAnnotation = (annotation: ReaderAnnotation) => {
    if (annotation.chapterId !== chapterId) {
      setChapterId(annotation.chapterId, 0);
    }
    setPendingParagraphJump(annotation.paragraphIndex);
  };

  const handlePickHighlightColor = (color: AnnotationColor) => {
    if (!selection) return;
    addAnnotation(chapterId, selection.paragraphIndex, selection.text, color);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const handleAddNoteFromSelection = () => {
    if (!selection) return;
    addAnnotation(chapterId, selection.paragraphIndex, selection.text, "yellow");
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    setPanel("annotations");
  };

  const remainingWords = useMemo(() => {
    const remainingParagraphs = chapters.slice(currentChapterIndex + 1).reduce((sum, c) => sum + c.paragraphs.length, 0);
    const avgWordsPerParagraph = 60;
    const inChapterFraction = totalPagesInChapter > 1 ? 1 - pageIndex / (totalPagesInChapter - 1) : 0.5;
    const currentChapterRemaining = (currentChapter?.paragraphs.length ?? 0) * inChapterFraction;
    return (remainingParagraphs + currentChapterRemaining) * avgWordsPerParagraph;
  }, [chapters, currentChapterIndex, currentChapter, totalPagesInChapter, pageIndex]);

  if (!currentChapter) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 flex select-text flex-col"
      style={{ backgroundColor: theme.bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ReaderTopBar
        visible={chromeVisible}
        bookTitle={book.title}
        chapterTitle={currentChapter.title.replace(/^\d+\.\s*/, "")}
        isBookmarked={isBookmarked(chapterId, pageIndex)}
        isFullscreen={isFullscreen}
        chromeColors={chromeColors}
        onBack={() => router.push(`/books/${book.id}`)}
        onToggleToc={() => setPanel(panel === "toc" ? null : "toc")}
        onToggleSearch={() => setPanel(panel === "search" ? null : "search")}
        onToggleBookmark={handleToggleBookmark}
        onToggleAnnotations={() => setPanel(panel === "annotations" ? null : "annotations")}
        onToggleSettings={() => setPanel(panel === "settings" ? null : "settings")}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="relative min-h-0 flex-1" onClick={handleContentTap}>
        <ReaderContent
          ref={contentRef}
          chapter={currentChapter}
          settings={settings}
          colors={{ bg: theme.bg, fg: theme.fg, muted: theme.muted }}
          pageIndex={pageIndex}
          onTotalPagesChange={setTotalPagesInChapter}
          annotations={annotations.filter((a) => a.chapterId === chapterId)}
          onTextSelected={setSelection}
        />

        <AnimatePresence>
          {selection && <SelectionToolbar rect={selection.rect} onPickColor={handlePickHighlightColor} onAddNote={handleAddNoteFromSelection} />}
        </AnimatePresence>
      </div>

      <ReaderBottomBar
        visible={chromeVisible}
        chromeColors={chromeColors}
        pageIndex={pageIndex}
        totalPagesInChapter={totalPagesInChapter}
        chapterOrder={currentChapter.order}
        totalChapters={chapters.length}
        overallProgress={progress}
        minutesSpent={minutesSpent}
        remainingWords={remainingWords}
        canGoPrev={pageIndex > 0 || currentChapterIndex > 0}
        canGoNext={pageIndex < totalPagesInChapter - 1 || currentChapterIndex < chapters.length - 1}
        onPrevPage={() => turnPage(-1)}
        onNextPage={() => turnPage(1)}
      />

      <TocPanel
        open={panel === "toc"}
        onClose={() => setPanel(null)}
        chapters={chapters}
        currentChapterId={chapterId}
        onSelectChapter={(id) => setChapterId(id, 0)}
      />

      <SettingsPanel
        open={panel === "settings"}
        onClose={() => setPanel(null)}
        settings={settings}
        onUpdate={update}
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
        onReset={reset}
      />

      <SearchPanel
        open={panel === "search"}
        onClose={() => setPanel(null)}
        query={query}
        onQueryChange={setQuery}
        results={results}
        onSelectResult={handleSelectResult}
      />

      <AnnotationsPanel
        open={panel === "annotations"}
        onClose={() => setPanel(null)}
        annotations={annotations}
        bookmarks={bookmarks}
        chapters={chapters}
        onSelect={handleSelectAnnotation}
        onRemove={removeAnnotation}
        onSaveNote={updateAnnotationNote}
        onSelectBookmark={handleSelectBookmark}
        onRemoveBookmark={removeBookmark}
      />
    </div>
  );
}
