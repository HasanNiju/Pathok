"use client";

import { use, useEffect, useState } from "react";
import { BookEditor } from "@/components/editor/book-editor";
import { Loading } from "@/components/ui/loading";
import { createClient } from "@/lib/supabase/client";
import { fetchBookById } from "@/lib/supabase/books-service";
import type { Book } from "@/types/book";

/**
 * Full-screen route for the v2 book editor (Module 3: "The editor must be
 * FULL SCREEN"). Separate from /admin/books/[id]/edit, which stays the
 * metadata form — this route owns only content editing.
 */
export default function BookEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<Book | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    fetchBookById(supabase, id).then((b) => {
      if (cancelled) return;
      if (!b) setNotFound(true);
      else setBook(b);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Book not found.</div>;
  }
  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <BookEditor bookId={book.id} bookTitle={book.title} coverUrl={book.coverUrl} />;
}
