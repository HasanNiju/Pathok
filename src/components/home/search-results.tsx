"use client";

import { useEffect, useRef } from "react";
import { SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { getBooksByCategory, searchBooks } from "@/lib/books";
import { getCategoryBySlug } from "@/lib/categories";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { BookCard } from "@/components/ui/book-card";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useOpenBook } from "@/hooks/use-book-open";
import type { Book } from "@/types/book";

interface SearchResultsProps {
  query: string;
  categorySlug: string | null;
  onClearFilter: () => void;
  books: Book[];
}

export function SearchResults({ query, categorySlug, onClearFilter, books }: SearchResultsProps) {
  const { t, language } = useTranslation();
  const { categories } = useCategories();
  const { user } = useAuth();
  const openBook = useOpenBook();
  const loggedRef = useRef<string | null>(null);

  const category = categorySlug ? getCategoryBySlug(categories, categorySlug) : undefined;
  const results = categorySlug ? getBooksByCategory(books, categorySlug) : searchBooks(books, query);

  // Log the search term once per distinct query, feeding the recommendation engine.
  useEffect(() => {
    const term = query.trim();
    if (!term || term === loggedRef.current) return;
    loggedRef.current = term;
    const timeout = window.setTimeout(() => {
      createClient()
        .from("search_history")
        .insert({ user_id: user?.id ?? null, query: term })
        .then(() => {});
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [query, user?.id]);

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
              onClick={() => openBook(book.id)}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
