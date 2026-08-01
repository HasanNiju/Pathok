import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/types/book";

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_bn: string;
  description: string;
  icon: string;
  active: boolean;
}

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameBn: row.name_bn,
    description: row.description,
    icon: row.icon,
    active: row.active,
  };
}

export async function fetchCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data as CategoryRow[]).map(fromRow);
}

/** Book counts per category slug, in one query — powers the admin list's "N books" line. */
export async function fetchCategoryBookCounts(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("books").select("category_slug").is("deleted_at", null);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data as { category_slug: string | null }[]) {
    if (!row.category_slug) continue;
    counts[row.category_slug] = (counts[row.category_slug] ?? 0) + 1;
  }
  return counts;
}

export async function createCategoryRow(
  supabase: SupabaseClient,
  input: { id: string; slug: string; name: string; nameBn: string; description: string; icon: string }
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      id: input.id,
      slug: input.slug,
      name: input.name,
      name_bn: input.nameBn,
      description: input.description,
      icon: input.icon,
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as CategoryRow);
}

export async function updateCategoryRow(
  supabase: SupabaseClient,
  id: string,
  input: { slug: string; name: string; nameBn: string; description: string; icon: string }
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({ slug: input.slug, name: input.name, name_bn: input.nameBn, description: input.description, icon: input.icon })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as CategoryRow);
}

export async function toggleCategoryActiveRow(supabase: SupabaseClient, id: string, active: boolean) {
  const { error } = await supabase.from("categories").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function deleteCategoryRow(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
