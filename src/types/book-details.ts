/**
 * Book Details-module-owned domain types.
 * Foundation types live in @/types, and the Home/Library catalog shape
 * (Book, Category) lives in @/types/book — neither is duplicated here.
 * This file only adds what the Book Details page introduces: extra
 * catalog metadata, reader reviews, and discussion comments.
 */

/** Print/edition metadata for a book, kept separate from the core Book
 *  record so Module 04's books.json never had to be touched. */
export interface BookMetadata {
  bookId: string;
  publisher: string;
  /** Language the text itself is written in — distinct from UI language. */
  language: "en" | "bn";
  isbn: string;
  pages: number;
}

/** A star rating + written review left on a book. */
export interface Review {
  id: string;
  bookId: string;
  userName: string;
  userAvatarUrl?: string;
  /** 1–5, whole stars. */
  rating: number;
  comment: string;
  /** ISO date. */
  createdAt: string;
}

/** A lighter-weight discussion comment on a book (no rating attached). */
export interface Comment {
  id: string;
  bookId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  /** ISO date. */
  createdAt: string;
}
