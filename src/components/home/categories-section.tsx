"use client";

import { motion } from "framer-motion";
import { categories } from "@/data/categories";
import { getBooksByCategory } from "@/data/books";
import { CategoryCard } from "@/components/home/category-card";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";

interface CategoriesSectionProps {
  activeCategory: string | null;
  onSelectCategory: (slug: string) => void;
}

export function CategoriesSection({ activeCategory, onSelectCategory }: CategoriesSectionProps) {
  const { t } = useTranslation();

  return (
    <section id="categories" className="scroll-mt-24">
      <SectionHeader title={t("home.categories.title")} subtitle={t("home.categories.subtitle")} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            bookCount={getBooksByCategory(category.slug).length}
            active={activeCategory === category.slug}
            onClick={() => onSelectCategory(category.slug)}
          />
        ))}
      </motion.div>
    </section>
  );
}
