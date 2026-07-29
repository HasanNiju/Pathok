import { ReaderView } from "@/components/book/reader-view";
import { getBookById } from "@/data/books";

interface ReadPageProps {
  params: Promise<{ bookId: string }>;
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { bookId } = await params;
  const book = getBookById(bookId);

  if (!book) {
    return null;
  }

  return <ReaderView bookId={book.id} title={book.title} author={book.author} />;
}
