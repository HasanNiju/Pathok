"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  BookText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { htmlToPlainText, isBlankParagraphHtml, sanitizeParagraphHtml } from "@/lib/rich-text";
import type { Chapter } from "@/types/reader";

interface ParagraphBlock {
  id: string;
  /** Last-synced HTML. While a block is mounted and focused, the live DOM
   *  is ahead of this — we only read it back at defined sync points (see
   *  file header comment below) so typing never re-renders the node the
   *  caret is sitting in. */
  html: string;
}

interface EditableChapter {
  id: string;
  title: string;
  blocks: ParagraphBlock[];
}

export interface ChapterEditorHandle {
  /** Reads whatever's currently in the DOM and returns save-ready chapters. */
  getChapters: () => Chapter[];
}

interface ChapterEditorProps {
  bookId: string;
  initialChapters: Chapter[];
  disabled?: boolean;
}

/** Reading speed used for the footer's "~N min" estimate — an average
 *  adult silent-reading pace, same ballpark the Reader's own progress
 *  math assumes elsewhere in the app. */
const WORDS_PER_MINUTE = 220;

const WRITING_SCALES = [
  { label: "S", fontSize: "15px", lineHeight: 1.75, maxWidth: "34rem" },
  { label: "M", fontSize: "17px", lineHeight: 1.85, maxWidth: "38rem" },
  { label: "L", fontSize: "19px", lineHeight: 1.95, maxWidth: "42rem" },
] as const;

let uidCounter = 0;
const nextId = () => `b${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chapterToEditable(chapter: Chapter): EditableChapter {
  const source =
    chapter.paragraphsHtml && chapter.paragraphsHtml.length === chapter.paragraphs.length
      ? chapter.paragraphsHtml
      : chapter.paragraphs.map(escapeHtml);
  return {
    id: chapter.id,
    title: chapter.title,
    blocks: source.length > 0 ? source.map((html) => ({ id: nextId(), html })) : [{ id: nextId(), html: "" }],
  };
}

function isCaretAtStart(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  const pre = document.createRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length === 0;
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/**
 * A from-scratch paragraph-block rich text editor — no external editor
 * library (this environment has no network access to install one), just
 * contentEditable + the Range API. Each paragraph is its own
 * contentEditable div so Enter/Backspace/paste can be handled precisely
 * without fighting the browser's inconsistent multi-line contentEditable
 * behavior.
 *
 * On top of that plumbing this renders a small word-processor-style shell:
 * a sticky formatting toolbar with live active-state highlighting, a
 * Notion/Medium-style floating bubble menu that appears over a text
 * selection, a paper-like writing surface with an adjustable comfort
 * scale, and a live word count / reading-time footer — so drafting a
 * chapter feels closer to Docs or Word than to a bare textarea, without
 * literally cloning either.
 *
 * KEY INVARIANT for a smooth typing experience: `ParagraphBlock.html` in
 * React state is only ever written with a value that already matches (or
 * is about to become) the live DOM — never touched on every keystroke.
 * React's dangerouslySetInnerHTML diffs by string value, so re-renders
 * that don't actually change a block's html leave that DOM node — and the
 * caret sitting inside it — untouched. The live word count relies on the
 * same guarantee: it's driven by a separate `tick` counter, never by
 * writing into `chapters`, so it can update on every keystroke for free.
 */
export const ChapterEditor = forwardRef<ChapterEditorHandle, ChapterEditorProps>(function ChapterEditor(
  { bookId, initialChapters, disabled },
  ref
) {
  const [chapters, setChapters] = useState<EditableChapter[]>(() =>
    initialChapters.length > 0
      ? initialChapters.map(chapterToEditable)
      : [{ id: `${bookId}-ch-1`, title: "Chapter 1", blocks: [{ id: nextId(), html: "" }] }]
  );
  const [activeId, setActiveId] = useState<string>(() => chapters[0]?.id ?? "");
  const [scaleIndex, setScaleIndex] = useState(1);
  const [format, setFormat] = useState({ bold: false, italic: false, underline: false, strike: false });
  const [bubble, setBubble] = useState<{ top: number; left: number } | null>(null);
  const [, setTick] = useState(0);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) blockRefs.current.set(id, el);
    else blockRefs.current.delete(id);
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeId) ?? chapters[0];

  /** Snapshots whatever chapter is currently mounted, using live DOM
   *  content for its blocks, and returns the resulting array — used both
   *  to persist a chapter's edits before switching away from it and to
   *  answer getChapters(). */
  const snapshot = useCallback(
    (source: EditableChapter[]) =>
      source.map((chapter) => {
        if (chapter.id !== activeId) return chapter;
        return {
          ...chapter,
          blocks: chapter.blocks.map((block) => {
            const el = blockRefs.current.get(block.id);
            return el ? { ...block, html: el.innerHTML } : block;
          }),
        };
      }),
    [activeId]
  );

  useImperativeHandle(
    ref,
    () => ({
      getChapters: () => {
        const live = snapshot(chapters);
        return live.map((chapter, index) => {
          const cleanHtml = chapter.blocks
            .map((b) => sanitizeParagraphHtml(b.html))
            .filter((html) => htmlToPlainText(html).length > 0);
          return {
            id: chapter.id,
            bookId,
            order: index + 1,
            title: chapter.title.trim() || `Chapter ${index + 1}`,
            paragraphs: cleanHtml.map(htmlToPlainText),
            paragraphsHtml: cleanHtml,
          };
        });
      },
    }),
    [chapters, snapshot, bookId]
  );

  const selectChapter = (id: string) => {
    if (id === activeId) return;
    setChapters((current) => snapshot(current));
    setActiveId(id);
    setBubble(null);
  };

  const addChapter = () => {
    const synced = snapshot(chapters);
    const newId = `${bookId}-ch-${Date.now().toString(36)}`;
    const chapter: EditableChapter = { id: newId, title: `Chapter ${synced.length + 1}`, blocks: [{ id: nextId(), html: "" }] };
    setChapters([...synced, chapter]);
    setActiveId(newId);
  };

  const removeChapter = (id: string) => {
    if (chapters.length <= 1) return;
    const next = chapters.filter((c) => c.id !== id);
    setChapters(next);
    if (id === activeId && next.length > 0) setActiveId(next[0]!.id);
  };

  const moveChapter = (id: string, dir: -1 | 1) => {
    setChapters((current) => {
      const index = current.findIndex((c) => c.id === id);
      const swapWith = index + dir;
      if (index < 0 || swapWith < 0 || swapWith >= current.length) return current;
      const next = current.slice();
      const a = next[index];
      const b = next[swapWith];
      if (!a || !b) return current;
      next[index] = b;
      next[swapWith] = a;
      return next;
    });
  };

  const renameActive = (title: string) => {
    setChapters((current) => current.map((c) => (c.id === activeId ? { ...c, title } : c)));
  };

  const focusBlock = (id: string, atStart = false) => {
    requestAnimationFrame(() => {
      const el = blockRefs.current.get(id);
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(!atStart);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  };

  const insertBlocksAfter = (blockId: string, htmls: string[], replaceIfBlank: boolean): string => {
    const inserted = htmls.map((html) => ({ id: nextId(), html }));
    setChapters((current) =>
      current.map((chapter) => {
        if (chapter.id !== activeId) return chapter;
        const index = chapter.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return chapter;
        const currentEl = blockRefs.current.get(blockId);
        const currentIsBlank = replaceIfBlank && currentEl ? isBlankParagraphHtml(currentEl.innerHTML) : false;
        const blocks = chapter.blocks.slice();
        if (currentIsBlank && inserted.length > 0) {
          const [first, ...rest] = inserted;
          blocks[index] = first!;
          blocks.splice(index + 1, 0, ...rest);
        } else {
          blocks.splice(index + 1, 0, ...inserted);
        }
        return { ...chapter, blocks };
      })
    );
    return inserted[inserted.length - 1]!.id;
  };

  const handleEnter = (blockId: string, el: HTMLDivElement) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const afterRange = range.cloneRange();
    afterRange.selectNodeContents(el);
    afterRange.setStart(range.endContainer, range.endOffset);
    const fragment = afterRange.extractContents();
    const wrapper = document.createElement("div");
    wrapper.appendChild(fragment);
    const newId = nextId();
    const newHtml = wrapper.innerHTML;
    const remainingHtml = el.innerHTML;
    setChapters((current) =>
      current.map((chapter) => {
        if (chapter.id !== activeId) return chapter;
        const index = chapter.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return chapter;
        const blocks = chapter.blocks.slice();
        const existing = blocks[index];
        if (!existing) return chapter;
        blocks[index] = { ...existing, html: remainingHtml };
        blocks.splice(index + 1, 0, { id: newId, html: newHtml });
        return { ...chapter, blocks };
      })
    );
    focusBlock(newId, true);
  };

  const handleBackspaceAtStart = (blockId: string, el: HTMLDivElement) => {
    const chapter = chapters.find((c) => c.id === activeId);
    if (!chapter) return;
    const index = chapter.blocks.findIndex((b) => b.id === blockId);
    if (index <= 0) return; // nothing above to merge into

    const prevBlock = chapter.blocks[index - 1];
    if (!prevBlock) return;
    const prevEl = blockRefs.current.get(prevBlock.id);
    const prevHtml = prevEl ? prevEl.innerHTML : prevBlock.html;
    const mergedHtml = prevHtml + el.innerHTML;

    setChapters(
      chapters.map((c) => {
        if (c.id !== activeId) return c;
        const blocks = c.blocks.slice();
        blocks[index - 1] = { ...prevBlock, html: mergedHtml };
        blocks.splice(index, 1);
        return { ...c, blocks };
      })
    );
    focusBlock(prevBlock.id);
  };

  const handlePaste = (blockId: string, e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    let paragraphs: string[] = [];

    if (html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      let blockEls = Array.from(doc.body.querySelectorAll("p")) as HTMLElement[];
      if (blockEls.length === 0) blockEls = Array.from(doc.body.children) as HTMLElement[];
      if (blockEls.length === 0) blockEls = [doc.body];
      paragraphs = blockEls.map((el) => sanitizeParagraphHtml(el.innerHTML)).filter((h) => htmlToPlainText(h).length > 0);
    }

    if (paragraphs.length === 0 && plain) {
      const doubleBreaks = plain
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
      const lines = doubleBreaks.length > 1 ? doubleBreaks : plain.split(/\n/).map((p) => p.trim()).filter(Boolean);
      paragraphs = lines.map((line) => sanitizeParagraphHtml(escapeHtml(line)));
    }

    if (paragraphs.length === 0) return;

    const targetEl = blockRefs.current.get(blockId);
    const targetIsBlank = targetEl ? isBlankParagraphHtml(targetEl.innerHTML) : true;

    // A single short paste into a paragraph that already has content —
    // e.g. pasting a word or a sentence fragment mid-edit — inserts
    // inline instead of splitting into a new paragraph.
    if (paragraphs.length === 1 && !targetIsBlank) {
      document.execCommand("insertHTML", false, paragraphs[0]);
      return;
    }

    const lastId = insertBlocksAfter(blockId, paragraphs, true);
    focusBlock(lastId);
  };

  const addParagraphAtEnd = () => {
    if (!activeChapter) return;
    const lastId = activeChapter.blocks[activeChapter.blocks.length - 1]?.id;
    if (!lastId) return;
    const newId = insertBlocksAfter(lastId, [""], false);
    focusBlock(newId);
  };

  /** Recomputes toolbar active-state (bold/italic/underline/strike) from
   *  whatever the current selection sits in. Cheap and read-only — safe
   *  to call on every selection change. */
  const refreshFormatState = useCallback(() => {
    const active = document.activeElement;
    const withinEditor = active instanceof HTMLElement && active.classList.contains("rich-paragraph");
    if (!withinEditor) return;
    setFormat({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikeThrough"),
    });
  }, []);

  /** Positions (or hides) the floating selection toolbar. Uses fixed
   *  viewport coordinates from the Range rect; hidden again on scroll so
   *  it never drifts away from the text it's attached to. */
  const refreshBubble = useCallback(() => {
    const sel = window.getSelection();
    const active = document.activeElement;
    const withinEditor = active instanceof HTMLElement && active.classList.contains("rich-paragraph");
    if (!withinEditor || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setBubble(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setBubble(null);
      return;
    }
    setBubble({ top: rect.top, left: rect.left + rect.width / 2 });
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      refreshFormatState();
      refreshBubble();
    };
    const onScroll = () => setBubble(null);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [refreshFormatState, refreshBubble]);

  /** Word count / reading time is intentionally driven by a debounced
   *  `tick` rather than by writing into `chapters` on every keystroke —
   *  see file header. It reads live DOM for the active chapter's blocks
   *  and last-synced html for every other chapter. */
  const scheduleTick = () => {
    if (tickTimer.current) clearTimeout(tickTimer.current);
    tickTimer.current = setTimeout(() => setTick((t) => t + 1), 250);
  };

  const chapterWordCount = useCallback(
    (chapter: EditableChapter) => {
      const texts = chapter.blocks.map((block) => {
        if (chapter.id === activeId) {
          const el = blockRefs.current.get(block.id);
          if (el) return el.textContent ?? "";
        }
        return htmlToPlainText(block.html);
      });
      return wordCount(texts.join(" "));
    },
    [activeId]
  );

  const activeWordCount = activeChapter ? chapterWordCount(activeChapter) : 0;
  const bookWordCount = useMemo(
    () => chapters.reduce((sum, c) => sum + chapterWordCount(c), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- also depends on live DOM text, refreshed via `tick`
    [chapters, chapterWordCount]
  );
  const readingMinutes = Math.max(1, Math.round(bookWordCount / WORDS_PER_MINUTE));

  const applyFormat = (command: "bold" | "italic" | "underline" | "strikeThrough") => (e: MouseEvent) => {
    e.preventDefault();
    document.execCommand(command);
    refreshFormatState();
    scheduleTick();
  };

  const runHistory = (command: "undo" | "redo") => (e: MouseEvent) => {
    e.preventDefault();
    document.execCommand(command);
    scheduleTick();
  };

  const scale = WRITING_SCALES[scaleIndex]!;

  if (!activeChapter) return null;

  const formatButtons: Array<{
    key: keyof typeof format;
    command: "bold" | "italic" | "underline" | "strikeThrough";
    icon: typeof Bold;
    label: string;
    shortcut: string;
  }> = [
    { key: "bold", command: "bold", icon: Bold, label: "Bold", shortcut: "Ctrl+B" },
    { key: "italic", command: "italic", icon: Italic, label: "Italic", shortcut: "Ctrl+I" },
    { key: "underline", command: "underline", icon: Underline, label: "Underline", shortcut: "Ctrl+U" },
    { key: "strike", command: "strikeThrough", icon: Strikethrough, label: "Strikethrough", shortcut: "" },
  ];

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:gap-5", disabled && "pointer-events-none opacity-50")}>
      {/* Outline sidebar */}
      <div className="flex shrink-0 flex-col gap-2 sm:w-56">
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <BookText className="h-3.5 w-3.5" /> Outline
          </span>
          <span className="text-xs text-muted-foreground">{bookWordCount.toLocaleString()} words</span>
        </div>
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-xl border border-border p-1.5 sm:max-h-[420px]">
          {chapters.map((chapter, index) => {
            const isActive = chapter.id === activeId;
            return (
              <div
                key={chapter.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg py-1.5 pl-2 pr-1.5 text-sm transition-colors",
                  isActive ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_hsl(var(--primary))]" : "text-foreground hover:bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => selectChapter(chapter.id)}
                  className="flex-1 truncate text-left"
                  title={chapter.title}
                >
                  {chapter.title || "Untitled"}
                </button>
                <button
                  type="button"
                  onClick={() => moveChapter(chapter.id, -1)}
                  disabled={index === 0}
                  className="hidden shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30 group-hover:block"
                  aria-label="Move chapter up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveChapter(chapter.id, 1)}
                  disabled={index === chapters.length - 1}
                  className="hidden shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30 group-hover:block"
                  aria-label="Move chapter down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(chapter.id)}
                    className="hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:block"
                    aria-label="Delete chapter"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addChapter} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add chapter
        </Button>
      </div>

      {/* Writing surface */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <input
          value={activeChapter.title}
          onChange={(e) => renameActive(e.target.value)}
          placeholder="Chapter title"
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary"
        />

        {/* Sticky formatting toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-0.5">
            {formatButtons.map(({ key, command, icon: Icon, label, shortcut }) => (
              <button
                key={key}
                type="button"
                onMouseDown={applyFormat(command)}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  format[key] ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                aria-label={label}
                aria-pressed={format[key]}
                title={shortcut ? `${label} (${shortcut})` : label}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={runHistory("undo")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={runHistory("redo")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Redo"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1 rounded-lg bg-secondary/60 p-0.5">
            {WRITING_SCALES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setScaleIndex(i)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                  i === scaleIndex ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                title="Writing text size (doesn't affect saved formatting)"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paper canvas */}
        <div
          ref={editorAreaRef}
          className="relative min-h-[280px] rounded-2xl border border-border bg-card px-5 py-4 shadow-sm sm:px-8 sm:py-6"
        >
          <div
            className="mx-auto flex flex-col gap-4 font-serif text-foreground"
            style={{ maxWidth: scale.maxWidth, fontSize: scale.fontSize, lineHeight: scale.lineHeight }}
          >
            {activeChapter.blocks.map((block) => (
              <ParagraphBlockEditor
                key={block.id}
                block={block}
                registerRef={registerRef}
                onEnter={handleEnter}
                onBackspaceAtStart={handleBackspaceAtStart}
                onPaste={handlePaste}
                onLiveInput={scheduleTick}
              />
            ))}
          </div>

          {/* Floating selection toolbar — Notion/Medium-style bubble menu */}
          {bubble && (
            <div
              className="fixed z-20 flex -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center gap-0.5 rounded-lg border border-border bg-foreground/95 p-1 text-background shadow-lg"
              style={{ top: bubble.top, left: bubble.left }}
            >
              {formatButtons
                .filter((b) => b.key !== "strike")
                .map(({ key, command, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onMouseDown={applyFormat(command)}
                    className={cn(
                      "rounded p-1.5 transition-colors hover:bg-background/20",
                      format[key] && "bg-background/25"
                    )}
                    aria-label={label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addParagraphAtEnd} className="w-fit gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add paragraph
          </Button>
          <p className="text-xs text-muted-foreground">
            This chapter: <span className="font-medium text-foreground">{activeWordCount.toLocaleString()}</span> words
            <span className="mx-1.5">·</span>
            Whole book: <span className="font-medium text-foreground">{bookWordCount.toLocaleString()}</span> words
            <span className="mx-1.5">·</span>~{readingMinutes} min read
          </p>
        </div>
      </div>
    </div>
  );
});

function ParagraphBlockEditor({
  block,
  registerRef,
  onEnter,
  onBackspaceAtStart,
  onPaste,
  onLiveInput,
}: {
  block: ParagraphBlock;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onEnter: (id: string, el: HTMLDivElement) => void;
  onBackspaceAtStart: (id: string, el: HTMLDivElement) => void;
  onPaste: (id: string, e: ClipboardEvent<HTMLDivElement>) => void;
  onLiveInput: () => void;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);

  const setRef = (el: HTMLDivElement | null) => {
    elRef.current = el;
    registerRef(block.id, el);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = elRef.current;
    if (!el) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter(block.id, el);
    } else if (e.key === "Backspace" && isCaretAtStart(el)) {
      e.preventDefault();
      onBackspaceAtStart(block.id, el);
    }
  };

  return (
    <div
      ref={setRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder="Write or paste this paragraph…"
      className="rich-paragraph min-h-[1.6em] whitespace-pre-wrap break-words outline-none"
      // eslint-disable-next-line react/no-danger -- initial mount only; see file header invariant.
      dangerouslySetInnerHTML={{ __html: block.html }}
      onKeyDown={handleKeyDown}
      onInput={onLiveInput}
      onPaste={(e) => onPaste(block.id, e)}
    />
  );
}
