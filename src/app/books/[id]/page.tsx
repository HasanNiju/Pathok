import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailsView } from "@/components/book-details/book-details-view";
import { createClient } from "@/lib/supabase/server";
import { fetchBookById, fetchBookMetadata } from "@/lib/supabase/books-service";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const book = await fetchBookById(supabase, id);

  return {
    title: book ? `${book.title} — Pathok` : "Pathok",
    description: book?.description,
  };
}

/**
 * Book Details module. Resolves the book from Supabase server-side (RLS
 * already limits this to published, non-deleted books for guests/readers)
 * and 404s for an unknown/unpublished id.
 */
export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const book = await fetchBookById(supabase, id);

  if (!book || book.status !== "published" || book.deletedAt) notFound();

  const metadata = await fetchBookMetadata(supabase, book.id);

  return <BookDetailsView book={book} metadata={metadata} />;
}
