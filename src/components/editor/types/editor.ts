/**
 * Editor v2 domain types.
 * Content is stored as ProseMirror/Tiptap JSON (`PMContent`) — never HTML —
 * per Module 19. One `EditorPage` is one editable page in the sidebar;
 * `content` is exactly what `editor.getJSON()` returns for that page.
 */

/** Loosely-typed ProseMirror document JSON — Tiptap's `JSONContent` shape. */
export interface PMContent {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMContent[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

export type EditorPageStatus = "empty" | "draft" | "ready";

export interface EditorPage {
  id: string;
  bookId: string;
  /** 1-based position, drives sidebar + outline order. */
  order: number;
  /** Optional editor-facing label — defaults to first heading found on save. */
  title: string;
  /** Working (unpublished) content — what autosave writes to. */
  draftContent: PMContent;
  /** Last-published content — what the Reader renders. Null until first publish. */
  publishedContent: PMContent | null;
  status: EditorPageStatus;
  createdAt: string;
  updatedAt: string;
}

/** Extra book-level metadata Module 11 introduces beyond the existing `Book` type. */
export interface EditorBookMeta {
  subtitle?: string;
  edition?: string;
  language: "bn" | "en";
}

export type EditorBookStatus = "draft" | "published" | "archived";

export interface EditorBook {
  bookId: string;
  status: EditorBookStatus;
  meta: EditorBookMeta;
  pages: EditorPage[];
  lastSavedAt: string | null;
}

/** One outline entry — a heading found inside a page, used by Module 16. */
export interface OutlineEntry {
  pageId: string;
  pageOrder: number;
  level: 1 | 2 | 3;
  text: string;
  /** Position of this heading node inside the page's ProseMirror doc. */
  pos: number;
}

/** Live counters shown in the status bar (Module 14). */
export interface EditorStats {
  words: number;
  characters: number;
  paragraphs: number;
  images: number;
  headings: number;
  readingMinutes: number;
}

export interface EditorSearchHit {
  pageId: string;
  pageOrder: number;
  from: number;
  to: number;
  snippet: string;
}

export const EMPTY_DOC: PMContent = { type: "doc", content: [{ type: "paragraph" }] };
