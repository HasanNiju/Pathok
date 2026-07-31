"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { getRecentBooksForAdmin } from "@/data/admin";
import { getCategoryBySlug } from "@/data/categories";
import { formatDate } from "@/lib/utils";

/** Most recently added catalog titles — read-only glance, links out to the
 *  public book page (a dedicated admin book editor is out of scope here). */
export function AdminRecentBooksSection() {
  const { t, language } = useTranslation();
  const books = getRecentBooksForAdmin(5);

  return (
    <section>
      <SectionHeader title={t("admin.recentBooks.title")} subtitle={t("admin.recentBooks.subtitle")} />

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {books.map((book, index) => {
          const category = getCategoryBySlug(book.categorySlug);

          return (
            <motion.div
              key={book.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.2, delay: index * 0.02, ease: "easeOut" }}
            >
              <Link
                href={`/books/${book.id}`}
                className="flex w-full items-center gap-3 p-3.5 text-left transition-colors duration-200 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-4"
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {book.coverUrl && (
                    <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="40px" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{book.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                </div>

                {category && (
                  <span className="hidden shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                    {language === "bn" ? category.nameBn : category.name}
                  </span>
                )}

                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(book.addedAt, language)}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
