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
 * inside it) — a distraction-free reading surface, in the spirit of a
 * native e-reader, without needing to change the shared AppShell.
 */
export default async function ReadPage({ params }: ReadPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const book = await fetchBookById(supabase, id);
  const chapters = book ? await fetchBookChapters(supabase, book.id) : [];

  if (!book || !book.contentReady || chapters.length === 0) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <ReaderView book={book} content={{ bookId: book.id, chapters }} />
    </ProtectedRoute>
  );
}
