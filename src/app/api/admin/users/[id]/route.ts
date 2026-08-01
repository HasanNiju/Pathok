import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Suspend/activate — Module 03. Status lives in `profiles`, not auth.users. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireRole(["admin", "super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const { status } = (await request.json()) as { status: "active" | "suspended" };
  if (status !== "active" && status !== "suspended") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** Deletes the auth user entirely (cascades to profiles + their content via FK). */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireRole(["admin", "super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  if (id === auth.userId) {
    return NextResponse.json({ error: "You can't delete your own account here." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
