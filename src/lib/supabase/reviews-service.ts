import type { SupabaseClient } from "@supabase/supabase-js";
import type { Review, Comment } from "@/types/book-details";

interface ReviewRow {
  id: string;
  book_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

interface CommentRow {
  id: string;
  book_id: string;
  text: string;
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

export async function fetchReviews(supabase: SupabaseClient, bookId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id,book_id,rating,comment,created_at,profiles(name,avatar_url)")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ReviewRow[]).map((row) => ({
    id: row.id,
    bookId: row.book_id,
    userName: row.profiles?.name ?? "Reader",
    userAvatarUrl: row.profiles?.avatar_url ?? undefined,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at.slice(0, 10),
  }));
}

export async function submitReviewRow(
  supabase: SupabaseClient,
  entry: { bookId: string; userId: string; rating: number; comment: string }
) {
  const { error } = await supabase
    .from("reviews")
    .insert({ book_id: entry.bookId, user_id: entry.userId, rating: entry.rating, comment: entry.comment });
  if (error) throw error;
}

export async function fetchComments(supabase: SupabaseClient, bookId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id,book_id,text,created_at,profiles(name,avatar_url)")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as CommentRow[]).map((row) => ({
    id: row.id,
    bookId: row.book_id,
    userName: row.profiles?.name ?? "Reader",
    userAvatarUrl: row.profiles?.avatar_url ?? undefined,
    text: row.text,
    createdAt: row.created_at.slice(0, 10),
  }));
}

export async function submitCommentRow(supabase: SupabaseClient, entry: { bookId: string; userId: string; text: string }) {
  const { error } = await supabase.from("comments").insert({ book_id: entry.bookId, user_id: entry.userId, text: entry.text });
  if (error) throw error;
}
