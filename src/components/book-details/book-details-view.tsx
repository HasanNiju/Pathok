import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { BackButton } from "@/components/ui/back-button";
import { BookHero } from "@/components/book-details/book-hero";
import { BookAboutSection } from "@/components/book-details/book-about-section";
import { ReviewsSection } from "@/components/book-details/reviews-section";
import { CommentsSection } from "@/components/book-details/comments-section";
import { RelatedBooksSection } from "@/components/book-details/related-books-section";
import { getBookMetadata } from "@/data/book-metadata";
import type { Book } from "@/types/book";

/**
 * Composes every Book Details section, same pattern as HomeView: a single
 * client component the (server) page renders, since several sections need
 * hooks (auth, translation, localStorage-backed reviews/comments/favorites).
 */
export function BookDetailsView({ book }: { book: Book }) {
  const metadata = getBookMetadata(book.id);

  return (
    <ResponsiveContainer className="flex flex-col gap-14 pb-10">
      <BackButton className="mt-6" />
      <BookHero book={book} metadata={metadata} />
      <BookAboutSection book={book} metadata={metadata} />
      <ReviewsSection book={book} />
      <CommentsSection book={book} />
      <RelatedBooksSection book={book} />
    </ResponsiveContainer>
  );
}
