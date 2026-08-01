import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Sets a new password for an admin account directly — Super Admin only. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const { newPassword } = (await request.json()) as { newPassword: string };
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password: newPassword });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
