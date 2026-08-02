"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Bold, Italic, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
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

/**
 * A from-scratch paragraph-block rich text editor — no external editor
 * library (this environment has no network access to install one), just
 * contentEditable + the Range API. Each paragraph is its own
 * contentEditable div so Enter/Backspace/paste can be handled precisely
 * without fighting the browser's inconsistent multi-line contentEditable
 * behavior.
 *
 * KEY INVARIANT for a smooth typing experience: `ParagraphBlock.html` in
 * React state is only ever written with a value that already matches (or
 * is about to become) the live DOM — never touched on every keystroke.
 * React's dangerouslySetInnerHTML diffs by string value, so re-renders
 * that don't actually change a block's html leave that DOM node — and the
 * caret sitting inside it — untouched.
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
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
    if (id === activeId) setActiveId(next[0].id);
  };

  const moveChapter = (id: string, dir: -1 | 1) => {
    setChapters((current) => {
      const index = current.findIndex((c) => c.id === id);
      const swapWith = index + dir;
      if (index < 0 || swapWith < 0 || swapWith >= current.length) return current;
      const next = current.slice();
      const tmp = next[index];
      next[index] = next[swapWith];
      next[swapWith] = tmp;
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
        if (currentIsBlank) {
          const [first, ...rest] = inserted;
          blocks[index] = first;
          blocks.splice(index + 1, 0, ...rest);
        } else {
          blocks.splice(index + 1, 0, ...inserted);
        }
        return { ...chapter, blocks };
      })
    );
    return inserted[inserted.length - 1].id;
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
        blocks[index] = { ...blocks[index], html: remainingHtml };
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

  const applyFormat = (command: "bold" | "italic") => (e: MouseEvent) => {
    e.preventDefault();
    document.execCommand(command);
  };

  if (!activeChapter) return null;

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:gap-5", disabled && "pointer-events-none opacity-50")}>
      {/* Chapter list */}
      <div className="flex shrink-0 flex-col gap-2 sm:w-52">
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-1.5 sm:max-h-[420px]">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={cn(
                "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm",
                chapter.id === activeId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
              )}
            >
              <button
                type="button"
                onClick={() => selectChapter(chapter.id)}
                className="flex-1 truncate text-left"
                title={chapter.title}
              >
                {index + 1}. {chapter.title || "Untitled"}
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
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addChapter} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add chapter
        </Button>
      </div>

      {/* Active chapter body */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <input
          value={activeChapter.title}
          onChange={(e) => renameActive(e.target.value)}
          placeholder="Chapter title"
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary"
        />

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            type="button"
            onMouseDown={applyFormat("bold")}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={applyFormat("italic")}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-[280px] rounded-lg border border-border bg-secondary/20 px-5 py-4 sm:px-8 sm:py-6">
          <div className="mx-auto flex max-w-xl flex-col gap-4 font-serif text-[16px] leading-[1.85]">
            {activeChapter.blocks.map((block) => (
              <ParagraphBlockEditor
                key={block.id}
                block={block}
                registerRef={registerRef}
                onEnter={handleEnter}
                onBackspaceAtStart={handleBackspaceAtStart}
                onPaste={handlePaste}
              />
            ))}
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addParagraphAtEnd} className="w-fit gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add paragraph
        </Button>
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
}: {
  block: ParagraphBlock;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onEnter: (id: string, el: HTMLDivElement) => void;
  onBackspaceAtStart: (id: string, el: HTMLDivElement) => void;
  onPaste: (id: string, e: ClipboardEvent<HTMLDivElement>) => void;
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
      className="rich-paragraph min-h-[1.6em] whitespace-pre-wrap break-words text-foreground outline-none"
      // eslint-disable-next-line react/no-danger -- initial mount only; see file header invariant.
      dangerouslySetInnerHTML={{ __html: block.html }}
      onKeyDown={handleKeyDown}
      onPaste={(e) => onPaste(block.id, e)}
    />
  );
}
