"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/types/book";
import { categories as seedCategories } from "@/data/categories";
import { getBooksByCategory } from "@/data/books";
import { STORAGE_KEYS } from "@/constants";
import { slugify, uniqueSlug } from "@/lib/categories";

export interface CategoryInput {
  name: string;
  nameBn: string;
  description: string;
  icon: string;
}

function readStoredCategories(): Category[] {
  if (typeof window === "undefined") return seedCategories;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.categories);
    if (!raw) return seedCategories;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Category[]) : seedCategories;
  } catch {
    return seedCategories;
  }
}

function generateCategoryId(): string {
  return `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Category Management module — client-side CRUD over the category catalog.
 * No backend per the PRD: seeded from data/categories.ts, then persisted to
 * localStorage (same mock-persistence pattern useBookInteractions already
 * uses for favorites/bookmarks), so admin edits survive a refresh. Every
 * place that lists or picks categories — Home's browse section, the future
 * Book Creation module's category picker — should read through this hook
 * rather than the static `categories` array, so create/edit/activate take
 * effect everywhere at once instead of only inside the admin panel.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [hydrated, setHydrated] = useState(false);

  // Load any admin edits from localStorage after mount (client-only).
  useEffect(() => {
    setCategories(readStoredCategories());
    setHydrated(true);
  }, []);

  // Persist every change, but only once the real (possibly stored) state
  // has loaded — otherwise this would overwrite storage with the seed.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
  }, [categories, hydrated]);

  const createCategory = useCallback((input: CategoryInput) => {
    setCategories((current) => {
      const slug = uniqueSlug(slugify(input.name), current);
      const category: Category = {
        id: generateCategoryId(),
        slug,
        name: input.name.trim(),
        nameBn: input.nameBn.trim(),
        description: input.description.trim(),
        icon: input.icon,
        active: true,
      };
      return [category, ...current];
    });
  }, []);

  const updateCategory = useCallback((id: string, input: CategoryInput) => {
    setCategories((current) => {
      const slug = uniqueSlug(slugify(input.name), current, id);
      return current.map((category) =>
        category.id === id
          ? {
              ...category,
              slug,
              name: input.name.trim(),
              nameBn: input.nameBn.trim(),
              description: input.description.trim(),
              icon: input.icon,
            }
          : category
      );
    });
  }, []);

  const toggleActive = useCallback((id: string) => {
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, active: !category.active } : category))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((current) => current.filter((category) => category.id !== id));
  }, []);

  /** Books currently filed under a category (by slug) — used to guard/warn on delete. */
  const getBookCount = useCallback((slug: string) => getBooksByCategory(slug).length, []);

  return {
    categories,
    activeCategories: categories.filter((category) => category.active),
    createCategory,
    updateCategory,
    toggleActive,
    deleteCategory,
    getBookCount,
  };
}
