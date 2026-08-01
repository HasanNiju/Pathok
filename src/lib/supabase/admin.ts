/**
 * Service-role Supabase client — SERVER ONLY. Never import this from a
 * "use client" file or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 * Used exclusively inside route handlers (src/app/api/**) that need to
 * bypass RLS: creating/deleting auth users, resetting passwords, and
 * suspending accounts (User Management / Admin Management modules).
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on the server.");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
