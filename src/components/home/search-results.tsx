"use client";

import { SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { books, getBooksByCategory } from "@/data/books";
import { getCategoryBySlug } from "@/data/categories";
import { BookCard } from "@/components/ui/book-card";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useOpenBook } from "@/hooks/use-book-open";

interface SearchResultsProps {
  query: string;
  categorySlug: string | null;
  onClearFilter: () => void;
}

export function SearchResults({ query, categorySlug, onClearFilter }: SearchResultsProps) {
  const { t, language } = useTranslation();
  const handleOpenBook = useOpenBook();

  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const normalizedQuery = query.trim().toLowerCase();

  let results = categorySlug ? getBooksByCategory(categorySlug) : books;
  if (normalizedQuery) {
    results = results.filter(
      (book) =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery)
    );
  }

  const title = category
    ? language === "bn"
      ? category.nameBn
      : category.name
    : t("home.search.resultsTitle");

  return (
    <section id="search-results" className="scroll-mt-24">
      <SectionHeader
        title={title}
        subtitle={t("home.search.resultsCount").replace("{count}", String(results.length))}
        action={
          <Button variant="ghost" size="sm" onClick={onClearFilter}>
            {t("home.search.clearFilter")}
          </Button>
        }
      />

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-5 w-5" aria-hidden="true" />}
          title={t("home.search.noResultsTitle")}
          description={t("home.search.noResultsDescription")}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {results.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              onClick={handleOpenBook}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
