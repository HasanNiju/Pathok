"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/book";

interface CategoryCardProps {
  category: Category;
  bookCount: number;
  active?: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, bookCount, active, onClick }: CategoryCardProps) {
  const { t, language } = useTranslation();
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon = icons[category.icon] ?? LucideIcons.BookOpen;
  const label = language === "bn" ? category.nameBn : category.name;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-pressed={active}
      className={cn(
        "flex w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200",
        active
          ? "border-primary bg-accent"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/60"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {t("home.categories.bookCount").replace("{count}", String(bookCount))}
        </span>
      </span>
    </motion.button>
  );
}
