import type { ReadingProgress } from "@/types/book";
import progressJson from "./reading-progress.json";

export const readingProgress: ReadingProgress[] = progressJson as ReadingProgress[];

/** A user's in-progress books, most recently read first. Empty for new/guest users. */
export function getContinueReading(userId: string | undefined): ReadingProgress[] {
  if (!userId) return [];

  return readingProgress
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
}

/**
 * A single book's progress for one user, if any — backs the Book Details
 * page's "Start Reading" vs "Continue Reading (N% complete)" CTA.
 */
export function getProgressForBook(
  userId: string | undefined,
  bookId: string
): ReadingProgress | undefined {
  if (!userId) return undefined;
  return readingProgress.find((entry) => entry.userId === userId && entry.bookId === bookId);
}
