import type { BookMetadata } from "@/types/book-details";
import metadataJson from "./book-metadata.json";

/**
 * Print/edition metadata (publisher, language, ISBN, page count) — one
 * entry per book, keyed by bookId. Kept as its own dataset rather than
 * folded into books.json so the Home module's catalog file never had to
 * be touched (see /src/data/README.md).
 */
export const bookMetadata: BookMetadata[] = metadataJson as BookMetadata[];

export function getBookMetadata(bookId: string): BookMetadata | undefined {
  return bookMetadata.find((entry) => entry.bookId === bookId);
}
