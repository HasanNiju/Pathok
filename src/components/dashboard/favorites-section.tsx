"use client";

import { Heart } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { DashboardBookGrid } from "@/components/dashboard/dashboard-book-grid";
import { useTranslation } from "@/hooks/use-translation";
import type { Book } from "@/types/book";

interface FavoritesSectionProps {
  books: Book[];
}

export function FavoritesSection({ books }: FavoritesSectionProps) {
  const { t } = useTranslation();

  return (
    <section id="favorites" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.favorites.title")} subtitle={t("dashboard.favorites.subtitle")} />
      <DashboardBookGrid
        books={books}
        emptyIcon={<Heart className="h-5 w-5" aria-hidden="true" />}
        emptyTitle={t("dashboard.favorites.emptyTitle")}
        emptyDescription={t("dashboard.favorites.emptyDescription")}
      />
    </section>
  );
}
