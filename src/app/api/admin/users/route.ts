import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ManagedUser } from "@/types/admin";

export const runtime = "nodejs";

/**
 * User Management (Module 03) list. profiles has no email column, so this
 * merges Supabase Auth's user list (for email) with `profiles` (name/role/
 * status) — admin-only, uses the service-role key server-side.
 */
export async function GET(request: Request) {
  const auth = await requireRole(["admin", "super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";

  const admin = createAdminClient();

  const [{ data: authList }, { data: profiles, error: profilesError }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id,name,role,status,avatar_url,created_at").eq("role", "user"),
  ]);

  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });

  const emailById = new Map(authList?.users.map((u) => [u.id, u.email ?? ""]) ?? []);

  let users: ManagedUser[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    email: emailById.get(p.id) ?? "",
    role: p.role,
    status: p.status,
    avatarUrl: p.avatar_url ?? undefined,
    createdAt: p.created_at,
  }));

  if (search) {
    users = users.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
  }

  return NextResponse.json({ users });
}
