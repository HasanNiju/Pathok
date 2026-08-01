import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ManagedUser } from "@/types/admin";

export const runtime = "nodejs";

/** Admin Management (Module 04) list — Super Admin only. */
export async function GET() {
  const auth = await requireRole(["super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = createAdminClient();
  const [{ data: authList }, { data: profiles, error }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id,name,role,status,avatar_url,created_at").in("role", ["admin", "super_admin"]),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const emailById = new Map(authList?.users.map((u) => [u.id, u.email ?? ""]) ?? []);
  const admins: ManagedUser[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    email: emailById.get(p.id) ?? "",
    role: p.role,
    status: p.status,
    avatarUrl: p.avatar_url ?? undefined,
    createdAt: p.created_at,
  }));

  return NextResponse.json({ admins });
}

/** Creates a brand-new admin account (auth user + profile), Super Admin only. */
export async function POST(request: Request) {
  const auth = await requireRole(["super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = (await request.json()) as { name: string; email: string; password: string; role: "admin" | "super_admin" };
  if (!body.name?.trim() || !body.email?.trim() || !body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Name, a valid email, and a password of 8+ characters are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: body.email.trim(),
    password: body.password,
    email_confirm: true,
    user_metadata: { name: body.name.trim() },
  });
  if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Could not create account." }, { status: 500 });

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: body.role, name: body.name.trim(), created_by: auth.userId })
    .eq("id", data.user.id);
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: data.user.id });
}
