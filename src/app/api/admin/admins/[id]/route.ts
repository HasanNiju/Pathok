import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Edit name/role, or activate/deactivate — Super Admin only. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireRole(["super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = (await request.json()) as { name?: string; role?: "admin" | "super_admin"; status?: "active" | "suspended" };

  if (id === auth.userId && (body.role === "admin" || body.status === "suspended")) {
    return NextResponse.json({ error: "You can't demote or suspend your own account." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.role !== undefined) patch.role = body.role;
  if (body.status !== undefined) patch.status = body.status;

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** Deletes an admin account entirely — Super Admin only. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireRole(["super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  if (id === auth.userId) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
