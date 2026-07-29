"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, BookOpen, PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CreateBookPage() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/80 p-6 shadow-soft sm:p-8 lg:p-10"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("book.create.badge")}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("book.create.title")}
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {t("book.create.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            {t("book.create.helper")}
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/70 bg-card/90 p-6 sm:p-7">
          <div className="flex items-center gap-2 text-primary">
            <Upload className="h-4 w-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">{t("book.create.coverTitle")}</h2>
          </div>

          <div className="mt-6 flex min-h-72 items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-secondary/50 p-6 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">{t("book.create.uploadLabel")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("book.create.uploadHint")}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-card/90 p-6 sm:p-7">
          <div className="flex items-center gap-2 text-primary">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">{t("book.create.formTitle")}</h2>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("book.create.titleLabel")}</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("book.create.titlePlaceholder")}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("book.create.authorLabel")}</label>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder={t("book.create.authorPlaceholder")}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("book.create.genreLabel")}</label>
              <input
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                placeholder={t("book.create.genrePlaceholder")}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("book.create.descriptionLabel")}</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("book.create.descriptionPlaceholder")}
                rows={5}
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" size="lg">
              {t("book.create.submit")}
            </Button>
            <Button variant="outline" size="lg">
              {t("book.create.cancel")}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
