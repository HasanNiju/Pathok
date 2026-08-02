/**
 * Reader-module-owned domain types.
 * Foundation types live in @/types, the catalog shape (Book, Category,
 * ReadingProgress) lives in @/types/book, and print metadata lives in
 * @/types/book-details — this file only adds what the Reader page
 * introduces: extracted book text, and everything the reader stores
 * locally (settings, session position, bookmarks, annotations).
 */

/** One chapter's extracted text — the end of the PDF/DOCX -> extract ->
 *  store pipeline described in the PRD. `paragraphs` are plain strings and
 *  drive search, TTS, and bookmark excerpts; the reader is responsible for
 *  typography, not the data layer. */
export interface Chapter {
  id: string;
  bookId: string;
  /** 1-based position in the book. */
  order: number;
  title: string;
  paragraphs: string[];
  /** Same paragraphs, but as sanitized inline HTML (<b>/<i> only) that
   *  preserves the bold/italic/heading formatting the source PDF actually
   *  had. Populated for PDF-sourced chapters; absent for chapters extracted
   *  before this shipped or from formats without a reliable style signal —
   *  the reader falls back to plain `paragraphs` when it's missing. */
  paragraphsHtml?: string[];
}

/** A book's full extracted text, chapter by chapter. */
export interface BookContent {
  bookId: string;
  chapters: Chapter[];
}

/** The four reader color themes — distinct from (and independent of) the
 *  app-wide light/dark/system theme, since Kindle-style readers let you
 *  pick a reading theme regardless of the surrounding UI's theme. */
export type ReaderThemeName = "light" | "dark" | "sepia" | "night";

export type ReaderFontFamily = "sans" | "serif" | "literary";

export type ReaderLineHeight = "compact" | "comfortable" | "relaxed" | "spacious";

export type ReaderLetterSpacing = "normal" | "wide" | "wider";

export type ReaderMargin = "narrow" | "comfortable" | "wide";

/** Everything the person can tune about how text is displayed — persisted
 *  per-device (like the app theme), not per-book, so it follows the
 *  reader across every title. */
export interface ReaderSettings {
  fontSize: number; // px
  fontFamily: ReaderFontFamily;
  lineHeight: ReaderLineHeight;
  letterSpacing: ReaderLetterSpacing;
  margin: ReaderMargin;
  theme: ReaderThemeName;
}

/** Where a person currently is in a specific book — one entry per
 *  user+book, persisted locally and read back on next visit to resume. */
export interface ReadingSession {
  bookId: string;
  chapterId: string;
  pageIndex: number;
  /** 0-100, derived from chapter position + in-chapter page progress. */
  progress: number;
  /** Total minutes spent reading this book across all sessions. */
  minutesSpent: number;
  updatedAt: string;
}

/** A saved place in a book — lighter-weight than an annotation, no text
 *  attached beyond a short excerpt for display in the Bookmarks panel. */
export interface ReaderBookmark {
  id: string;
  bookId: string;
  chapterId: string;
  pageIndex: number;
  /** First few words on that page, shown as a label in the bookmarks list. */
  excerpt: string;
  createdAt: string;
}

export type AnnotationColor = "yellow" | "green" | "blue" | "pink";

/** A highlighted span of text, optionally with a note attached — Notes
 *  and Highlights share one store since a note is just a highlight with
 *  commentary, the same relationship Kindle itself uses. */
export interface ReaderAnnotation {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  color: AnnotationColor;
  /** The highlighted excerpt itself (kept short — not the full paragraph). */
  text: string;
  /** Present only when the person added commentary to the highlight. */
  note?: string;
  createdAt: string;
}

/** A single search hit inside a book, resolved to an exact chapter/page. */
export interface ReaderSearchResult {
  chapterId: string;
  chapterTitle: string;
  paragraphIndex: number;
  pageIndex: number;
  /** Short surrounding-text snippet with the match in context. */
  snippet: string;
}
