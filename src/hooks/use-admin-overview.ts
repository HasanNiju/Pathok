"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchPublishedBooks } from "@/lib/supabase/books-service";
import { getRecentlyAddedBooks } from "@/lib/books";
import type { Book } from "@/types/book";

export interface AdminStats {
  totalBooks: number;
  totalCategories: number;
  totalUsers: number;
  totalReviews: number;
}

/**
 * Live Overview stats + "Recent Books" list for the admin dashboard,
 * replacing the old dummy-data derivation with real Supabase counts.
 */
export function useAdminOverview() {
  const [stats, setStats] = useState<AdminStats>({ totalBooks: 0, totalCategories: 0, totalUsers: 0, totalReviews: 0 });
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from("books").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      fetchPublishedBooks(supabase),
    ]).then(([booksRes, categoriesRes, usersRes, reviewsRes, commentsRes, books]) => {
      setStats({
        totalBooks: booksRes.count ?? 0,
        totalCategories: categoriesRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalReviews: (reviewsRes.count ?? 0) + (commentsRes.count ?? 0),
      });
      setRecentBooks(getRecentlyAddedBooks(books, 5));
      setIsLoading(false);
    });
  }, []);

  return { stats, recentBooks, isLoading };
}
