"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { getCategoryBySlug } from "@/data/categories";
import type { Book } from "@/types/book";
import type { BookMetadata } from "@/types/book-details";

interface BookAboutSectionProps {
  book: Book;
  metadata?: BookMetadata;
}

export function BookAboutSection({ book, metadata }: BookAboutSectionProps) {
  const { t, language } = useTranslation();
  const category = getCategoryBySlug(book.categorySlug);
  const genreLabel = category ? (language === "bn" ? category.nameBn : category.name) : book.categorySlug;

  const rows: { label: string; value: string }[] = [
    { label: t("bookDetails.metadata.author"), value: book.author },
    { label: t("bookDetails.metadata.genre"), value: genreLabel },
    ...(metadata
      ? [
          { label: t("bookDetails.metadata.publisher"), value: metadata.publisher },
          { label: t("bookDetails.metadata.isbn"), value: metadata.isbn },
          { label: t("bookDetails.metadata.pagesLabel"), value: t("bookDetails.metadata.pages").replace("{count}", String(metadata.pages)) },
        ]
      : []),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="grid gap-6 lg:grid-cols-[1.6fr_1fr]"
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("bookDetails.about.title")}
        </h2>
        <p className="mt-3 max-w-reading text-base leading-relaxed text-muted-foreground">{book.description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-foreground">{t("bookDetails.metadata.title")}</h3>
          <dl className="flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </motion.section>
  );
}
