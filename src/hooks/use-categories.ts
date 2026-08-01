"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/types/book";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCategories,
  fetchCategoryBookCounts,
  createCategoryRow,
  updateCategoryRow,
  toggleCategoryActiveRow,
  deleteCategoryRow,
} from "@/lib/supabase/categories-service";
import { slugify, uniqueSlug } from "@/lib/categories";

export interface CategoryInput {
  name: string;
  nameBn: string;
  description: string;
  icon: string;
}

function generateCategoryId(): string {
  return `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Category Management module — Supabase-backed CRUD over the category
 * catalog. Every place that lists or picks categories (Home's browse
 * section, the Book Creation category picker) reads through this hook,
 * so create/edit/activate take effect everywhere at once.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookCounts, setBookCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const supabase = createClient();
    const [cats, counts] = await Promise.all([fetchCategories(supabase), fetchCategoryBookCounts(supabase)]);
    setCategories(cats);
    setBookCounts(counts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const createCategory = useCallback(
    async (input: CategoryInput) => {
      const supabase = createClient();
      const slug = uniqueSlug(slugify(input.name), categories);
      const category = await createCategoryRow(supabase, { id: generateCategoryId(), slug, ...input });
      setCategories((current) => [category, ...current]);
    },
    [categories]
  );

  const updateCategory = useCallback(
    async (id: string, input: CategoryInput) => {
      const supabase = createClient();
      const slug = uniqueSlug(slugify(input.name), categories, id);
      const updated = await updateCategoryRow(supabase, id, { slug, ...input });
      setCategories((current) => current.map((category) => (category.id === id ? updated : category)));
    },
    [categories]
  );

  const toggleActive = useCallback(
    async (id: string) => {
      const target = categories.find((category) => category.id === id);
      if (!target) return;
      const supabase = createClient();
      await toggleCategoryActiveRow(supabase, id, !target.active);
      setCategories((current) =>
        current.map((category) => (category.id === id ? { ...category, active: !category.active } : category))
      );
    },
    [categories]
  );

  const deleteCategory = useCallback(async (id: string) => {
    const supabase = createClient();
    await deleteCategoryRow(supabase, id);
    setCategories((current) => current.filter((category) => category.id !== id));
  }, []);

  /** Books currently filed under a category (by slug) — used to guard/warn on delete. */
  const getBookCount = useCallback((slug: string) => bookCounts[slug] ?? 0, [bookCounts]);

  return {
    categories,
    activeCategories: categories.filter((category) => category.active),
    isLoading,
    createCategory,
    updateCategory,
    toggleActive,
    deleteCategory,
    getBookCount,
    reload,
  };
}
