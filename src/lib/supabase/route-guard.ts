import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/**
 * Confirms the requesting session belongs to a user whose profile role is
 * in `allowedRoles`. Used at the top of every privileged API route
 * (User Management, Admin Management, Book upload) instead of trusting
 * the client. Returns the session user id + role on success.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, message: "Not signed in." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const role = (profile?.role ?? "user") as UserRole;
  if (!allowedRoles.includes(role)) {
    return { ok: false as const, status: 403, message: "Not authorized." };
  }

  return { ok: true as const, userId: user.id, role };
}
