import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchBookById, fetchBookChapters } from "@/lib/supabase/books-service";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReaderView } from "@/components/reader/reader-view";

interface ReadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const book = await fetchBookById(supabase, id);
  return { title: book ? `${book.title} — Pathok` : "Pathok" };
}

/**
 * The Reader page itself renders full-bleed (see ReaderView, which covers
 * the viewport as a fixed overlay above the app shell rather than sitting
 * inside it) — a distraction-free reading surface.
 *
 * Every book is written directly in the admin chapter editor (see
 * ChapterEditor / BookForm) and read through the same reflowable
 * typography Reader: a two-column spread on desktop, one column on
 * mobile, with in-book search, highlighting, bookmarks, and Read Aloud.
 */
export default async function ReadPage({ params }: ReadPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const book = await fetchBookById(supabase, id);

  if (!book || !book.contentReady) notFound();

  const chapters = await fetchBookChapters(supabase, book.id);
  if (chapters.length === 0) notFound();

  return (
    <ProtectedRoute>
      <ReaderView book={book} content={{ bookId: book.id, chapters }} />
    </ProtectedRoute>
  );
}
