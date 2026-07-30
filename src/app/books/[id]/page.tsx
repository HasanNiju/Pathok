import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailsView } from "@/components/book-details/book-details-view";
import { getBookById } from "@/data/books";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = getBookById(id);

  return {
    title: book ? `${book.title} — Pathok` : "Pathok",
    description: book?.description,
  };
}

/**
 * Book Details module. Composition of the hero, About, Reviews, Comments,
 * and Related Books sections lives in BookDetailsView (client component,
 * since it needs auth/translation/localStorage-backed hooks) — this file
 * stays a server component, resolves the book from the dummy catalog, and
 * 404s for an unknown id.
 */
export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = getBookById(id);

  if (!book) notFound();

  return <BookDetailsView book={book} />;
}
