"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchPublishedBooks } from "@/lib/supabase/books-service";
import type { Book } from "@/types/book";

/**
 * The full public catalog (published, non-deleted books), fetched once from
 * Supabase and shared by every module that used to read the static
 * data/books.ts dataset — Home rails, Search, Related Books, Dashboard.
 * Selectors in @/lib/books operate on the returned `books` array.
 */
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const supabase = createClient();
    const data = await fetchPublishedBooks(supabase);
    setBooks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { books, isLoading, reload };
}
