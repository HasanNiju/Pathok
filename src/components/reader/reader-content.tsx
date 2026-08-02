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
  colors: { bg: string; fg: string; muted: string };
  pageIndex: number;
  onTotalPagesChange: (total: number) => void;
  annotations: ReaderAnnotation[];
  onTextSelected: (info: TextSelectionInfo | null) => void;
}

export const ReaderContent = forwardRef<ReaderContentHandle, ReaderContentProps>(function ReaderContent(
  { chapter, settings, colors, pageIndex, onTotalPagesChange, annotations, onTextSelected },
  ref
) {
  const clipRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [clipWidth, setClipWidth] = useState(0);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const marginOption = MARGIN_OPTIONS.find((m) => m.value === settings.margin) ?? MARGIN_OPTIONS[1] ?? MARGIN_OPTIONS[0];
  const marginRem = isMobile ? marginOption?.remMobile ?? 1.5 : marginOption?.remDesktop ?? 6;
  const lineHeightRatio = LINE_HEIGHT_OPTIONS.find((o) => o.value === settings.lineHeight)?.ratio ?? 1.7;
  const letterSpacingEm = LETTER_SPACING_OPTIONS.find((o) => o.value === settings.letterSpacing)?.em ?? 0;
  const fontClass =
    settings.fontFamily === "sans" ? "font-sans" : settings.fontFamily === "literary" ? "font-literary" : "font-serif";

  // Desktop shows a two-column spread (like a physical book laid open);
  // mobile falls back to a single column that fills the screen.
  const columnsPerPage = isMobile ? 1 : 2;
  const columnGapPx = columnsPerPage > 1 ? 56 : 0;
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

  return (
    <div
      ref={clipRef}
      className="relative h-full w-full overflow-hidden"
      style={{ padding: `${isMobile ? 1.25 : 2.5}rem ${marginRem}rem` }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden" onMouseUp={handleMouseUp}>
        {/* Chapter title — spans the full page width above the column(s),
            unlike the flowing paragraphs below. Always rendered (so the
            reserved height is identical on every page) but only visible on
            the chapter's first page, the way a printed chapter opener works. */}
        <div
          className={cn(fontClass, "shrink-0 pb-6 text-center transition-opacity duration-200")}
          style={{ opacity: pageIndex === 0 ? 1 : 0 }}
          aria-hidden={pageIndex !== 0}
        >
          <h2 className="font-bold tracking-tight" style={{ fontSize: `${settings.fontSize * 1.4}px`, color: colors.fg }}>
            {chapter.title}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className={cn(fontClass, "transition-transform duration-300 ease-out")}
            style={{
              columnWidth: columnWidthPx ? `${columnWidthPx}px` : "100%",
              columnGap: columnGapPx,
              ...(columnsPerPage > 1
                ? { columnRuleWidth: "1px", columnRuleStyle: "solid" as const, columnRuleColor: colors.muted }
                : {}),
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
      </div>
    </div>
  );
});
