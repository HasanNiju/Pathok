"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Compass, Sparkles, TrendingUp, Clock3, Library } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SearchBar } from "@/components/ui/search-bar";
import { BookCard } from "@/components/ui/book-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  categories,
  continueReading,
  featuredBook,
  latestBooks,
  popularBooks,
  recommendedBooks,
  recentlyAdded,
  trendingBooks,
} from "@/data/home";

interface SectionHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

function SectionHeader({ title, description, actionLabel, actionHref }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <a href={actionHref} className="text-sm font-medium text-primary hover:underline">
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const pools = [...latestBooks, ...popularBooks, ...recommendedBooks, ...recentlyAdded, ...trendingBooks];
    return pools.filter((book) => {
      const haystack = `${book.title} ${book.author} ${book.description} ${book.category}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:gap-10">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/80 p-7 shadow-soft sm:p-8 lg:p-12"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("home.hero.badge")}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              {t("home.hero.description")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" size="lg">
                {t("home.hero.primaryAction")}
              </Button>
              <Button variant="outline" size="lg">
                {t("home.hero.secondaryAction")}
              </Button>
            </div>
          </div>

          <Card className="border-primary/10 bg-background/70 p-0 backdrop-blur">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">{t("home.hero.featuredLabel")}</p>
                  <p className="text-lg font-bold text-foreground">{featuredBook.title}</p>
                </div>
                <div className="rounded-full bg-secondary p-2 text-primary">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-border bg-secondary/70 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{featuredBook.author}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{featuredBook.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{featuredBook.category}</span>
                  <span>{featuredBook.readTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("home.search.title")}</p>
              <p className="text-sm text-muted-foreground">{t("home.search.description")}</p>
            </div>
            <div className="rounded-full bg-secondary p-2 text-primary">
              <Library className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <SearchBar value={query} onChange={setQuery} placeholder={t("home.search.placeholder")} />
          </div>
          {query && filteredBooks.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {filteredBooks.slice(0, 4).map((book) => (
                <div key={book.id} className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-sm font-semibold text-foreground">{book.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                </div>
              ))}
            </div>
          ) : query ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("home.search.empty")}</p>
          ) : null}
        </Card>

        <Card className="border-border/70 bg-card/90 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <p className="text-sm font-semibold">{t("home.highlights.title")}</p>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: t("home.highlights.reads"), value: "18k" },
              { label: t("home.highlights.aural"), value: "92%" },
              { label: t("home.highlights.favorite"), value: "4.9/5" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-3">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.continueReading")}
          description={t("home.sections.continueReadingDescription")}
          actionLabel={t("home.sections.viewAll")}
          actionHref="#"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {continueReading.map((book) => (
            <Card key={book.id} className="overflow-hidden border-border/70 bg-card/90 p-0">
              <div className="flex gap-4 p-4 sm:p-5">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
                  <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    {book.readTime}
                  </div>
                  <p className="mt-2 text-base font-semibold text-foreground">{book.title}</p>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{book.description}</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${book.progress ?? 0}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.latestBooks")}
          description={t("home.sections.latestBooksDescription")}
          actionLabel={t("home.sections.viewAll")}
          actionHref="#"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latestBooks.map((book) => (
            <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.trending")}
          description={t("home.sections.trendingDescription")}
          actionLabel={t("home.sections.viewAll")}
          actionHref="#"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {trendingBooks.map((book) => (
            <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.popular")}
          description={t("home.sections.popularDescription")}
          actionLabel={t("home.sections.viewAll")}
          actionHref="#"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {popularBooks.map((book) => (
            <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.recommended")}
          description={t("home.sections.recommendedDescription")}
          actionLabel={t("home.sections.viewAll")}
          actionHref="#"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {recommendedBooks.map((book) => (
            <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.categories")}
          description={t("home.sections.categoriesDescription")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="border-border/70 bg-card/90 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{category.label}</p>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </div>
                <div className="rounded-full bg-secondary p-2 text-primary">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={t("home.sections.recentlyAdded")}
          description={t("home.sections.recentlyAddedDescription")}
          actionLabel={t("home.sections.viewAll")}
          actionHref="#"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {recentlyAdded.map((book) => (
            <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl} />
          ))}
        </div>
      </section>

      <footer className="rounded-[1.75rem] border border-border bg-card/90 px-8 py-10 text-center shadow-soft sm:px-10">
        <p className="text-lg font-semibold text-foreground">{t("home.footer.title")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("home.footer.description")}</p>
      </footer>
    </div>
  );
}
