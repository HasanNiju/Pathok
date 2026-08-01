"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchBooksAdmin,
  softDeleteBook,
  restoreBook,
  updateBookRow,
  type AdminBookListParams,
} from "@/lib/supabase/books-service";
import type { Book } from "@/types/book";

const PAGE_SIZE = 10;

export function useAdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminBookListParams["status"]>("all");
  const [sort, setSort] = useState<AdminBookListParams["sort"]>("newest");
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const result = await fetchBooksAdmin(supabase, {
      search,
      status,
      sort,
      page,
      pageSize: PAGE_SIZE,
      includeDeleted: showDeleted,
    });
    setBooks(result.books);
    setTotal(result.total);
    setIsLoading(false);
  }, [search, status, sort, page, showDeleted]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Reset to page 1 whenever a filter changes underneath the current page.
  useEffect(() => {
    setPage(1);
  }, [search, status, sort, showDeleted]);

  const remove = useCallback(
    async (id: string) => {
      await softDeleteBook(createClient(), id);
      await reload();
    },
    [reload]
  );

  const restore = useCallback(
    async (id: string) => {
      await restoreBook(createClient(), id);
      await reload();
    },
    [reload]
  );

  const publish = useCallback(
    async (id: string) => {
      await updateBookRow(createClient(), id, { status: "published" });
      await reload();
    },
    [reload]
  );

  const unpublish = useCallback(
    async (id: string) => {
      await updateBookRow(createClient(), id, { status: "draft" });
      await reload();
    },
    [reload]
  );

  return {
    books,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    isLoading,
    search,
    setSearch,
    status,
    setStatus,
    sort,
    setSort,
    page,
    setPage,
    showDeleted,
    setShowDeleted,
    remove,
    restore,
    publish,
    unpublish,
    reload,
  };
}
