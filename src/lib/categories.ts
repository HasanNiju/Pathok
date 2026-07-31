/**
 * Category Management module — helpers shared by the admin Categories UI
 * and the (future) Book Creation category picker. Kept separate from
 * lib/validation.ts, which is scoped to the Auth module.
 */
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Curated icon choices offered in the category form — resolved the same
 *  way CategoryCard already resolves `category.icon` at render time. */
export const CATEGORY_ICON_OPTIONS: string[] = [
  "BookOpen",
  "Compass",
  "Rocket",
  "Wand2",
  "UserRound",
  "Briefcase",
  "Sparkles",
  "Landmark",
  "Feather",
  "Siren",
  "Heart",
  "Library",
  "Tag",
  "Globe",
  "GraduationCap",
  "Music",
  "Film",
  "Utensils",
  "Ghost",
  "Swords",
];

/** Resolves a stored Lucide icon name to its component, falling back to BookOpen. */
export function resolveCategoryIcon(icon: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[icon] ?? LucideIcons.BookOpen;
}

/** Converts a display name to a URL-safe slug, e.g. "Young Adult" -> "young-adult". */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Ensures a slug is unique among existing categories, appending -2, -3, ... as needed. */
export function uniqueSlug(
  base: string,
  existing: { slug: string; id: string }[],
  excludeId?: string
): string {
  const fallback = base || "category";
  const taken = new Set(existing.filter((category) => category.id !== excludeId).map((category) => category.slug));

  if (!taken.has(fallback)) return fallback;

  let attempt = 2;
  let candidate = `${fallback}-${attempt}`;
  while (taken.has(candidate)) {
    attempt += 1;
    candidate = `${fallback}-${attempt}`;
  }
  return candidate;
}
