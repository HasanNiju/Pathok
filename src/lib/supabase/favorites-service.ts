import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchFavoriteBookIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase.from("favorites").select("book_id").eq("user_id", userId);
  if (error) throw error;
  return (data as { book_id: string }[]).map((row) => row.book_id);
}

export async function toggleFavoriteRow(supabase: SupabaseClient, userId: string, bookId: string, isFavorite: boolean) {
  if (isFavorite) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("book_id", bookId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("favorites").insert({ user_id: userId, book_id: bookId });
    if (error) throw error;
  }
}
