/**
 * Home-module-owned domain types.
 * Foundation types (Language, ThemeMode, UserRole, AppUser) live in
 * @/types and are not duplicated here — this file only adds what the
 * Home / Library data layer introduces. The Reader module may extend
 * Book later (chapters, extracted text) without touching this shape.
 */

/** A single browsable category (genre/shelf) books can belong to. */
export interface Category {
  /** Stable identifier, independent of slug — slugs can be edited by an admin. */
  id: string;
  slug: string;
  name: string;
  /** Bangla label — categories are shown to guests too, so they're translated directly on the record rather than via the dictionary. */
  nameBn: string;
  description: string;
  /** Lucide icon name, resolved by the components that render category chips/cards. */
  icon: string;
  /** Inactive categories are hidden from readers and the book-creation picker, but kept for existing books that reference them. */
  active: boolean;
}

/** A book in the catalog. Dummy data only — no backend per the PRD. */
export interface Book {
  id: string;
  title: string;
  author: string;
  /** Local generated cover art, e.g. "/covers/book-01.svg". */
  coverUrl: string;
  categorySlug: string;
  description: string;
  /** 0–5, one decimal. */
  rating: number;
  /** Total number of readers — backs the "Popular" rail. */
  readCount: number;
  /** ISO date the book was first published/released — backs "Latest Books". */
  publishedAt: string;
  /** ISO date the book was added to the Pathok catalog — backs "Recently Added". */
  addedAt: string;
  /** Approximate reading time in minutes, shown as a light metadata chip. */
  readingMinutes: number;
  /** Hand-picked trending rank; lower is more trending. Only trending titles carry this. */
  trendingRank?: number;
  /** Editorial pick surfaced in "Recommended". */
  isRecommended?: boolean;
}

/** A reader's progress in a book — keyed by the demo user id in the dummy dataset. */
export interface ReadingProgress {
  userId: string;
  bookId: string;
  /** 0–100. */
  progress: number;
  lastReadAt: string;
}
