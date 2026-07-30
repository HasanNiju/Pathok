import type { Category } from "@/types/book";
import categoriesJson from "./categories.json";

export const categories: Category[] = categoriesJson as Category[];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
