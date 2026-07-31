import type { BookContent } from "@/types/reader";
import bookContentJson from "./book-content.json";

/**
 * Extracted book text — dummy data standing in for the PDF/DOCX -> extract
 * -> store pipeline described in the PRD (see scripts/generate-book-content.mjs
 * for how this file was produced). No backend, per project rules.
 */
export const bookContent: BookContent[] = bookContentJson as BookContent[];

export function getBookContent(bookId: string): BookContent | undefined {
  return bookContent.find((entry) => entry.bookId === bookId);
}

export function getChapter(bookId: string, chapterId: string) {
  return getBookContent(bookId)?.chapters.find((chapter) => chapter.id === chapterId);
}

/** Total paragraph count across every chapter — used as a cheap proxy for
 *  "book length" when weighting overall reading progress. */
export function getTotalParagraphCount(bookId: string): number {
  const content = getBookContent(bookId);
  if (!content) return 0;
  return content.chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0);
}
