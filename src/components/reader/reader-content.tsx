"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useAnimationControls, motion } from "framer-motion";
import { ANNOTATION_COLOR_HEX, LETTER_SPACING_OPTIONS, LINE_HEIGHT_OPTIONS, MARGIN_OPTIONS } from "@/constants/reader";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { Chapter, ReaderAnnotation, ReaderSettings } from "@/types/reader";

export interface ReaderContentHandle {
  /** Which page a given paragraph currently lands on, after layout. */
  getPageForParagraph: (paragraphIndex: number) => number;
  /** The first paragraph visible on a given page — used for bookmark excerpts. */
  getFirstParagraphOnPage: (pageIndex: number) => { index: number; text: string } | null;
}

export interface TextSelectionInfo {
  paragraphIndex: number;
  text: string;
  rect: DOMRect;
}

interface ReaderContentProps {
  chapter: Chapter;
  settings: ReaderSettings;
  colors: { bg: string; fg: string; muted: string; desk: string; spine: string };
  pageIndex: number;
  /** Sign of the most recent page turn, used only to pick which way the
   *  page-turn flourish tilts — purely decorative, never affects layout. */
  turnDirection: 1 | -1;
  onTotalPagesChange: (total: number) => void;
  annotations: ReaderAnnotation[];
  onTextSelected: (info: TextSelectionInfo | null) => void;
}

export const ReaderContent = forwardRef<ReaderContentHandle, ReaderContentProps>(function ReaderContent(
  { chapter, settings, colors, pageIndex, turnDirection, onTotalPagesChange, annotations, onTextSelected },
  ref
) {
  const clipRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [clipWidth, setClipWidth] = useState(0);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const marginOption = MARGIN_OPTIONS.find((m) => m.value === settings.margin) ?? MARGIN_OPTIONS[1] ?? MARGIN_OPTIONS[0];
  const marginRem = isMobile ? marginOption?.remMobile ?? 1.5 : marginOption?.remDesktop ?? 6;
  const lineHeightRatio = LINE_HEIGHT_OPTIONS.find((o) => o.value === settings.lineHeight)?.ratio ?? 1.7;
  const letterSpacingEm = LETTER_SPACING_OPTIONS.find((o) => o.value === settings.letterSpacing)?.em ?? 0;
  const fontClass =
    settings.fontFamily === "sans" ? "font-sans" : settings.fontFamily === "literary" ? "font-literary" : "font-serif";

  // Desktop shows a two-column spread (like a physical book laid open);
  // mobile falls back to a single column that fills the screen.
  const columnsPerPage = isMobile ? 1 : 2;
  const columnGapPx = columnsPerPage > 1 ? 72 : 0;
  const columnWidthPx = clipWidth
    ? Math.max(80, (clipWidth - (columnsPerPage - 1) * columnGapPx) / columnsPerPage)
    : 0;
  // The CSS column-gap applies uniformly between *every* pair of adjacent
  // columns — including the seam between one spread's last column and the
  // next spread's first. A page turn must advance by that full step (page
  // width + one extra gap), not just the visible page width, or the next
  // page would show a sliver of the previous spread's trailing gap instead
  // of starting exactly at its own first column.
  const pageStep = clipWidth ? clipWidth + columnGapPx : 0;

  // Measure the clip window's width (the exact pixel width of one page).
  useLayoutEffect(() => {
    if (!clipRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setClipWidth(Math.round(width));
    });
    observer.observe(clipRef.current);
    return () => observer.disconnect();
  }, []);

  // Recompute total pages whenever the rendered text reflows.
  useLayoutEffect(() => {
    if (!trackRef.current || !pageStep) return;
    const scrollWidth = trackRef.current.scrollWidth;
    const total = Math.max(1, Math.round(scrollWidth / pageStep));
    onTotalPagesChange(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStep, columnsPerPage, chapter.id, settings.fontSize, settings.fontFamily, settings.lineHeight, settings.letterSpacing, settings.margin]);

  useImperativeHandle(
    ref,
    () => ({
      getPageForParagraph: (paragraphIndex) => {
        if (!trackRef.current || !pageStep) return 0;
        const el = trackRef.current.querySelector<HTMLElement>(`[data-p="${paragraphIndex}"]`);
        if (!el) return 0;
        return Math.floor(el.offsetLeft / pageStep);
      },
      getFirstParagraphOnPage: (pageIdx) => {
        if (!trackRef.current || !pageStep) return null;
        const nodes = trackRef.current.querySelectorAll<HTMLElement>("[data-p]");
        for (const node of Array.from(nodes)) {
          const page = Math.floor(node.offsetLeft / pageStep);
          if (page === pageIdx) {
            const index = Number(node.dataset.p);
            return { index, text: chapter.paragraphs[index]?.slice(0, 90) ?? "" };
          }
        }
        return null;
      },
    }),
    [pageStep, chapter.paragraphs]
  );

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!selection || !text || selection.rangeCount === 0) {
      onTextSelected(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const container =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement)
        : range.commonAncestorContainer.parentElement;
    const paragraphEl = container?.closest<HTMLElement>("[data-p]");
    if (!paragraphEl || !trackRef.current?.contains(paragraphEl)) {
      onTextSelected(null);
      return;
    }
    onTextSelected({
      paragraphIndex: Number(paragraphEl.dataset.p),
      text,
      rect: range.getBoundingClientRect(),
    });
  }, [onTextSelected]);

  /** Wraps any highlighted substrings of a paragraph in a colored <mark>. */
  function renderParagraph(text: string, paragraphIndex: number) {
    const marks = annotations.filter((a) => a.paragraphIndex === paragraphIndex);
    if (marks.length === 0) return text;

    let segments: { text: string; color?: string }[] = [{ text }];
    for (const mark of marks) {
      const nextSegments: typeof segments = [];
      for (const seg of segments) {
        if (seg.color || !mark.text) {
          nextSegments.push(seg);
          continue;
        }
        const idx = seg.text.indexOf(mark.text);
        if (idx === -1) {
          nextSegments.push(seg);
          continue;
        }
        if (idx > 0) nextSegments.push({ text: seg.text.slice(0, idx) });
        nextSegments.push({ text: seg.text.slice(idx, idx + mark.text.length), color: ANNOTATION_COLOR_HEX[mark.color] });
        if (idx + mark.text.length < seg.text.length) nextSegments.push({ text: seg.text.slice(idx + mark.text.length) });
      }
      segments = nextSegments;
    }

    return segments.map((seg, i) =>
      seg.color ? (
        <mark key={i} style={{ backgroundColor: seg.color, color: "inherit" }} className="rounded-sm px-0.5">
          {seg.text}
        </mark>
      ) : (
        <span key={i}>{seg.text}</span>
      )
    );
  }

  // ——— Page-turn flourish ———
  // A physical book page doesn't just slide — it tilts very slightly and
  // catches the light as it turns. This is purely decorative: it animates
  // the page card as a whole (never the measured `clipRef`, so pagination
  // math above is completely unaffected), triggered whenever the visible
  // page or chapter changes.
  const pageControls = useAnimationControls();
  const sweepControls = useAnimationControls();
  const prevKeyRef = useRef(`${chapter.id}:${pageIndex}`);

  useEffect(() => {
    const key = `${chapter.id}:${pageIndex}`;
    if (prevKeyRef.current !== key) {
      pageControls.start({
        rotateY: [0, -turnDirection * 2, 0],
        scale: [1, 0.995, 1],
        transition: { duration: 0.42, ease: [0.32, 0, 0.2, 1] },
      });
      sweepControls.start({
        opacity: [0, 0.5, 0],
        transition: { duration: 0.42, ease: "easeOut" },
      });
      prevKeyRef.current = key;
    }
  }, [chapter.id, pageIndex, turnDirection, pageControls, sweepControls]);

  return (
    <div
      className="relative flex h-full w-full items-stretch justify-center"
      style={{ backgroundColor: colors.desk, perspective: 2200 }}
    >
      {/* The book itself — a paper-colored card resting on the desk. Full
          bleed on mobile (like a phone e-reader), inset with depth on
          wider screens (like a book lying open on a table). */}
      <motion.div
        animate={pageControls}
        style={{ backgroundColor: colors.bg, transformStyle: "preserve-3d" }}
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden",
          "md:my-6 md:h-[calc(100%-3rem)] md:max-w-[1400px] md:rounded-[3px]",
          "md:shadow-[0_1px_1px_rgba(0,0,0,0.05),0_12px_28px_-8px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.12)]",
          "md:ring-1 md:ring-black/5"
        )}
      >
        {/* Center spine — the shadowed gutter of an open two-page spread. */}
        {columnsPerPage === 2 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-16 -translate-x-1/2"
            style={{
              background: `linear-gradient(to right, transparent, ${colors.spine} 45%, ${colors.spine} 55%, transparent)`,
            }}
          />
        )}

        {/* Light sweep — a brief catch-the-light highlight on every turn. */}
        <motion.div
          aria-hidden="true"
          animate={sweepControls}
          initial={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              turnDirection > 0
                ? "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)"
                : "linear-gradient(260deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)",
          }}
        />

        <div
          ref={clipRef}
          className="relative h-full w-full overflow-hidden"
          style={{ padding: `${isMobile ? 1.25 : 2.75}rem ${marginRem}rem` }}
        >
          <div className="flex h-full w-full flex-col overflow-hidden" onMouseUp={handleMouseUp}>
            {/* Chapter title — spans the full page width above the column(s),
                unlike the flowing paragraphs below. Always rendered (so the
                reserved height is identical on every page) but only visible on
                the chapter's first page, the way a printed chapter opener works. */}
            <div
              className={cn(fontClass, "shrink-0 pb-8 text-center transition-opacity duration-200")}
              style={{ opacity: pageIndex === 0 ? 1 : 0 }}
              aria-hidden={pageIndex !== 0}
            >
              <p
                className="mb-2 text-[11px] font-sans font-semibold uppercase tracking-[0.2em]"
                style={{ color: colors.muted }}
              >
                Chapter {chapter.order}
              </p>
              <h2
                className="font-bold tracking-tight"
                style={{ fontSize: `${settings.fontSize * 1.55}px`, color: colors.fg, lineHeight: 1.3 }}
              >
                {chapter.title.replace(/^\d+\.\s*/, "")}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <div
                ref={trackRef}
                className={cn(fontClass, "transition-transform duration-300 ease-out")}
                style={{
                  columnWidth: columnWidthPx ? `${columnWidthPx}px` : "100%",
                  columnGap: columnGapPx,
                  columnFill: "auto",
                  height: "100%",
                  transform: `translateX(-${pageIndex * pageStep}px)`,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: lineHeightRatio,
                  letterSpacing: `${letterSpacingEm}em`,
                  color: colors.fg,
                }}
              >
                {chapter.paragraphs.map((paragraph, index) => {
                  const html = chapter.paragraphsHtml?.[index];
                  const hasHighlight = annotations.some((a) => a.paragraphIndex === index);
                  return (
                    <p key={index} data-p={index} className="mb-5 break-words [-webkit-hyphens:auto] [hyphens:auto]">
                      {html && !hasHighlight ? (
                        // Bold/italic exactly as written in the chapter editor —
                        // sanitized to <b>/<i> only on save (see
                        // sanitizeParagraphHtml), so this is safe to inject.
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                      ) : (
                        renderParagraph(paragraph, index)
                      )}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Folio — small printed-style page number in the bottom corner,
                like a real book, echoing (not replacing) the progress
                footer rendered by ReaderBottomBar outside the page. */}
            <div
              className="pointer-events-none shrink-0 pt-4 text-center font-serif text-xs"
              style={{ color: colors.muted, opacity: 0.7 }}
            >
              {pageIndex + 1}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
