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

export async function uploadBrandingAsset(supabase: SupabaseClient, file: File, slot: "logo" | "dark-logo" | "favicon"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${slot}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
}
