"use client";

import { useState } from "react";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { HeroSearch } from "@/components/home/hero-search";
import { SearchResults } from "@/components/home/search-results";
import { ContinueReadingSection } from "@/components/home/continue-reading-section";
import { BookRail } from "@/components/home/book-rail";
import { CategoriesSection } from "@/components/home/categories-section";
import { useTranslation } from "@/hooks/use-translation";
import { useBooks } from "@/hooks/use-books";
import {
  getLatestBooks,
  getTrendingBooks,
  getPopularBooks,
  getRecommendedBooks,
  getRecentlyAddedBooks,
} from "@/lib/books";

/**
 * Composes every Home page section. A search query and a category filter
 * are lifted here (rather than owned by Search/Categories individually) so
 * picking a category and typing a search term drive the same results view.
 */
export function HomeView() {
  const { t } = useTranslation();
  const { books } = useBooks();
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const isFiltering = query.trim().length > 0 || categorySlug !== null;

  const handleSelectCategory = (slug: string) => {
    setCategorySlug((current) => (current === slug ? null : slug));
    // Scroll to the results grid that appears above the categories grid —
    // it's already in the DOM by the time this click handler runs.
    requestAnimationFrame(() => {
      document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleClearFilter = () => {
    setQuery("");
    setCategorySlug(null);
  };

  return (
    <ResponsiveContainer className="flex flex-col gap-14 pb-10">
      <HeroSearch query={query} onQueryChange={setQuery} />

      {isFiltering ? (
        <SearchResults query={query} categorySlug={categorySlug} onClearFilter={handleClearFilter} books={books} />
      ) : (
        <ContinueReadingSection />
      )}

      <BookRail id="latest" title={t("home.latest.title")} subtitle={t("home.latest.subtitle")} books={getLatestBooks(books)} />
      <BookRail id="trending" title={t("home.trending.title")} subtitle={t("home.trending.subtitle")} books={getTrendingBooks(books)} />
      <BookRail id="popular" title={t("home.popular.title")} subtitle={t("home.popular.subtitle")} books={getPopularBooks(books)} />
      <BookRail
        id="recommended"
        title={t("home.recommended.title")}
        subtitle={t("home.recommended.subtitle")}
        books={getRecommendedBooks(books)}
      />

      <CategoriesSection activeCategory={categorySlug} onSelectCategory={handleSelectCategory} books={books} />

      <BookRail
        id="recently-added"
        title={t("home.recentlyAdded.title")}
        subtitle={t("home.recentlyAdded.subtitle")}
        books={getRecentlyAddedBooks(books)}
      />
    </ResponsiveContainer>
  );
}
