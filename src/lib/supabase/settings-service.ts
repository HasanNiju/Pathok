import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSetting<T>(supabase: SupabaseClient, key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (error || !data) return fallback;
  return { ...fallback, ...(data.value as Partial<T>) };
}

export async function saveSetting<T>(supabase: SupabaseClient, key: string, value: T) {
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

