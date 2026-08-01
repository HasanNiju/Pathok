import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchBookById, fetchBookChapters } from "@/lib/supabase/books-service";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReaderView } from "@/components/reader/reader-view";
import { PdfReaderLoader } from "@/components/reader/pdf-reader-loader";

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
 * The Reader page itself renders full-bleed (see ReaderView/PdfReaderView,
 * which cover the viewport as a fixed overlay above the app shell rather
 * than sitting inside it) — a distraction-free reading surface.
 *
 * Two entirely different reading experiences, chosen by how the book was
 * uploaded: a PDF is shown exactly as authored (react-pdf, no text
 * extraction, so original formatting/layout/images are preserved) with a
 * two-page desktop spread / one-page mobile layout; a DOCX-sourced book
 * uses the extracted-text typography Reader, which is what makes
 * highlighting, in-book search, and Read Aloud possible for it.
 */
export default async function ReadPage({ params }: ReadPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const book = await fetchBookById(supabase, id);

  if (!book || !book.contentReady) notFound();

  if (book.fileType === "pdf") {
    if (!book.fileUrl) notFound();
    return (
      <ProtectedRoute>
        <PdfReaderLoader book={book} />
      </ProtectedRoute>
    );
  }

  const chapters = await fetchBookChapters(supabase, book.id);
  if (chapters.length === 0) notFound();

  return (
    <ProtectedRoute>
      <ReaderView book={book} content={{ bookId: book.id, chapters }} />
    </ProtectedRoute>
  );
}
