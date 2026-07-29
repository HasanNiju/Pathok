import { BookDetailsPage } from "@/components/book/book-details-page";

interface BookPageProps {
  params: Promise<{ bookId: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookId } = await params;

  return <BookDetailsPage bookId={bookId} />;
}
