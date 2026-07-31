import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookById } from "@/data/books";
import { getBookContent } from "@/data/book-content";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReaderView } from "@/components/reader/reader-view";

interface ReadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = getBookById(id);
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
  const book = getBookById(id);
  const content = book ? getBookContent(book.id) : undefined;

  if (!book || !content || content.chapters.length === 0) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <ReaderView book={book} content={content} />
    </ProtectedRoute>
  );
}
