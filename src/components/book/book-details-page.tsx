"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  Star,
  BookOpen,
  Clock3,
  CalendarDays,
  Languages,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookCard } from "@/components/ui/book-card";
import { cn } from "@/lib/utils";
import { getBookById, getRelatedBooks } from "@/data/books";

interface BookDetailsPageProps {
  bookId: string;
}

export function BookDetailsPage({ bookId }: BookDetailsPageProps) {
  const { t } = useTranslation();
  const book = getBookById(bookId);
  const [bookmarked, setBookmarked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  if (!book) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[1.75rem] border border-border bg-card/90 p-8 text-center shadow-soft">
        <p className="text-xl font-semibold text-foreground">{t("book.details.notFound")}</p>
        <p className="text-sm text-muted-foreground">{t("book.details.notFoundDescription")}</p>
      </div>
    );
  }

  const relatedBooks = getRelatedBooks(book.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`overflow-hidden rounded-[1.75rem] border border-border bg-gradient-to-br ${book.bannerColor} p-6 shadow-soft sm:p-8 lg:p-10`}
      >
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-sm font-medium text-foreground">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t("book.details.featuredLabel")}
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{book.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-2 text-sm font-medium text-foreground">
                <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
                {book.rating} · {book.reviews} {t("book.details.reviews")}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {book.readTime}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/read/${book.id}`}>
                <Button variant="primary" size="lg">
                  {t("book.details.continueReading")}
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                {t("book.details.share")}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {book.published}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                <Languages className="h-4 w-4" aria-hidden="true" />
                {book.language}
              </div>
            </div>

            <Card className="mt-6 border-border/70 bg-background/70 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("book.details.continueReading")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Chapter 12 · 64% complete</p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  64%
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: "64%" }} />
              </div>
            </Card>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background/70 p-3 shadow-soft">
              <div className="relative aspect-[2.7/4] overflow-hidden rounded-[1.2rem] bg-secondary">
                <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="(max-width: 768px) 80vw, 320px" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90 p-6 sm:p-7">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setBookmarked((value) => !value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-sm transition-colors hover:bg-secondary",
                bookmarked ? "border-primary bg-primary/10 text-primary" : "text-foreground"
              )}
            >
              <Bookmark className="h-4 w-4" aria-hidden="true" />
              {t("book.details.bookmark")}
            </button>
            <button
              type="button"
              onClick={() => setFavorited((value) => !value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-sm transition-colors hover:bg-secondary",
                favorited ? "border-primary bg-primary/10 text-primary" : "text-foreground"
              )}
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              {t("book.details.favorite")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary">
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {t("book.details.share")}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary/70 p-4">
              <p className="text-sm font-semibold text-foreground">{t("book.details.author")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/70 p-4">
              <p className="text-sm font-semibold text-foreground">{t("book.details.genre")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{book.genre}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/70 p-4">
              <p className="text-sm font-semibold text-foreground">{t("book.details.published")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{book.published}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/70 p-4">
              <p className="text-sm font-semibold text-foreground">{t("book.details.language")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{book.language}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-foreground">{t("book.details.description")}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{book.longDescription}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {book.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {tag}
              </span>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 bg-card/90 p-6 sm:p-7">
          <div className="flex items-center gap-2 text-primary">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">{t("book.details.reviews")}</h2>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-secondary/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Reader rating</p>
                <p className="text-sm text-muted-foreground">{book.reviews} {t("book.details.reviews")}</p>
              </div>
              <div className="text-2xl font-semibold text-foreground">{book.rating.toFixed(1)}</div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={cn("h-4 w-4", index < Math.round(book.rating) ? "fill-current" : "text-muted-foreground")} aria-hidden="true" />
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {book.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{comment.user}</p>
                    <p className="text-xs text-muted-foreground">{comment.role}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{comment.time}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{comment.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t("book.details.relatedBooks")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("book.details.relatedBooksDescription")}</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedBooks.map((relatedBook) => (
            <Link key={relatedBook.id} href={`/book/${relatedBook.id}`}>
              <BookCard title={relatedBook.title} author={relatedBook.author} coverUrl={relatedBook.coverUrl} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
