import type { Comment } from "@/types/book-details";
import commentsJson from "./comments.json";

/**
 * Seed discussion comments for the dummy catalog. Most books have a few;
 * some have none, to exercise the Comments section's empty state.
 * User-submitted comments written in this browser are layered on top at
 * read time by useBookComments — this file is the read-only seed data only.
 */
export const comments: Comment[] = commentsJson as Comment[];

export function getCommentsByBookId(bookId: string): Comment[] {
  return comments
    .filter((comment) => comment.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
