"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Bookmark, Share2, BookOpen, Clock, Calendar, Globe2, Layers } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useBookInteractions } from "@/hooks/use-book-interactions";
import { useBookReviews } from "@/hooks/use-book-reviews";
import { getCategoryBySlug } from "@/data/categories";
import { getProgressForBook } from "@/data/reading-progress";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/book";
import type { BookMetadata } from "@/types/book-details";

interface BookHeroProps {
  book: Book;
  metadata?: BookMetadata;
}

/** Copies the current page URL, falling back gracefully if clipboard access is denied. */
async function shareCurrentPage(title: string): Promise<"shared" | "copied" | "failed"> {
  const url = typeof window !== "undefined" ? window.location.href : "";

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      // User cancelled the native share sheet — not an error worth surfacing.
      return "failed";
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function BookHero({ book, metadata }: BookHeroProps) {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { isFavorite, isBookmarked, toggleFavorite, toggleBookmark } = useBookInteractions(book.id);
  const { reviews } = useBookReviews(book.id);

  const category = getCategoryBySlug(book.categorySlug);
  const categoryLabel = category ? (language === "bn" ? category.nameBn : category.name) : book.categorySlug;
  const progress = getProgressForBook(user?.id, book.id);

  const handleShare = async () => {
    const result = await shareCurrentPage(book.title);
    if (result === "copied") {
      addToast({ title: t("bookDetails.actions.linkCopied") });
    } else if (result === "failed") {
      addToast({ title: t("bookDetails.actions.shareFailed") });
    }
  };

  const handleReadingCta = () => {
    addToast({ title: t("shell.comingSoon") });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Banner backdrop — abstract, category-tinted; all text below is real DOM, never baked into the image. */}
      <div className="relative h-40 w-full sm:h-52 lg:h-64">
        <Image src={`/banners/${book.id}.svg`} alt="" fill priority className="object-cover" sizes="100vw" />
      </div>

      <div className="px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
          {/* Cover — pulled up over the banner, matching book-card's 2:3 ratio. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative -mt-16 w-32 shrink-0 overflow-hidden rounded-xl border-4 border-card bg-secondary shadow-soft-lg sm:-mt-20 sm:w-40 lg:w-48"
          >
            <div className="relative aspect-[2/3] w-full">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 128px, 192px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-3 pt-2 sm:pt-0"
          >
            <span className="inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {categoryLabel}
            </span>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{book.title}</h1>
              <p className="mt-1 text-base text-muted-foreground">{book.author}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StarRating value={book.rating} size="sm" />
              <span className="text-sm font-medium text-foreground">{book.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                · {t("bookDetails.reviews.count").replace("{count}", String(reviews.length))}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Metadata chips */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-border py-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {t("home.minutesRead").replace("{minutes}", String(book.readingMinutes))}
          </span>
          {metadata && (
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4" aria-hidden="true" />
              {t("bookDetails.metadata.pages").replace("{count}", String(metadata.pages))}
            </span>
          )}
          {metadata && (
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              {metadata.language === "bn" ? t("language.bn") : t("language.en")}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {new Date(book.publishedAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
              year: "numeric",
              month: "long",
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={handleReadingCta} className="min-w-[10rem]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {progress
              ? t("bookDetails.actions.continueReading").replace("{progress}", String(progress.progress))
              : t("bookDetails.actions.startReading")}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            aria-pressed={isFavorite}
            aria-label={t(isFavorite ? "bookDetails.actions.removeFavorite" : "bookDetails.actions.addFavorite")}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-destructive text-destructive")} aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleBookmark}
            aria-pressed={isBookmarked}
            aria-label={t(isBookmarked ? "bookDetails.actions.removeBookmark" : "bookDetails.actions.addBookmark")}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-primary text-primary")} aria-hidden="true" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleShare} aria-label={t("bookDetails.actions.share")}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
