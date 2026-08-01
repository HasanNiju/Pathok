import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReadingProgress } from "@/types/book";
import type { ReaderBookmark } from "@/types/reader";

interface ProgressRow {
  user_id: string;
  book_id: string;
  progress: number;
  last_read_at: string;
  chapter_id: string | null;
  page_index: number;
  minutes_spent: number;
}

function fromRow(row: ProgressRow): ReadingProgress {
  return {
    userId: row.user_id,
    bookId: row.book_id,
    progress: row.progress,
    lastReadAt: row.last_read_at,
    chapterId: row.chapter_id ?? undefined,
    pageIndex: row.page_index,
    minutesSpent: row.minutes_spent,
  };
}

/** A user's in-progress books, most recently read first — Continue Reading + Dashboard history. */
export async function fetchReadingProgressForUser(supabase: SupabaseClient, userId: string): Promise<ReadingProgress[]> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false });
  if (error) throw error;
  return (data as ProgressRow[]).map(fromRow);
}

export async function fetchProgressForBook(
  supabase: SupabaseClient,
  userId: string,
  bookId: string
): Promise<ReadingProgress | undefined> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ProgressRow) : undefined;
}

/** Upserts a reading position — called on chapter/page change and every ~60s while reading. */
export async function saveReadingProgress(
  supabase: SupabaseClient,
  entry: { userId: string; bookId: string; progress: number; chapterId: string; pageIndex: number; minutesSpent: number }
) {
  const { error } = await supabase.from("reading_progress").upsert({
    user_id: entry.userId,
    book_id: entry.bookId,
    progress: entry.progress,
    chapter_id: entry.chapterId,
    page_index: entry.pageIndex,
    minutes_spent: entry.minutesSpent,
    last_read_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ---- Bookmarks (Module 08) ----

interface BookmarkRow {
  id: string;
  book_id: string;
  chapter_id: string;
  page_index: number;
  excerpt: string;
  created_at: string;
}

function bookmarkFromRow(row: BookmarkRow): ReaderBookmark {
  return {
    id: row.id,
    bookId: row.book_id,
    chapterId: row.chapter_id,
    pageIndex: row.page_index,
    excerpt: row.excerpt,
    createdAt: row.created_at,
  };
}

export async function fetchBookmarks(supabase: SupabaseClient, userId: string, bookId: string): Promise<ReaderBookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id,book_id,chapter_id,page_index,excerpt,created_at")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as BookmarkRow[]).map(bookmarkFromRow);
}

export async function fetchAllBookmarks(supabase: SupabaseClient, userId: string): Promise<ReaderBookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id,book_id,chapter_id,page_index,excerpt,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as BookmarkRow[]).map(bookmarkFromRow);
}

export async function addBookmarkRow(
  supabase: SupabaseClient,
  entry: { userId: string; bookId: string; chapterId: string; pageIndex: number; excerpt: string }
): Promise<ReaderBookmark> {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: entry.userId,
      book_id: entry.bookId,
      chapter_id: entry.chapterId,
      page_index: entry.pageIndex,
      excerpt: entry.excerpt,
    })
    .select("id,book_id,chapter_id,page_index,excerpt,created_at")
    .single();
  if (error) throw error;
  return bookmarkFromRow(data as BookmarkRow);
}

export async function removeBookmarkRow(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  if (error) throw error;
}
