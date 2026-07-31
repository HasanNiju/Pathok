import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Every /admin/* route is gated to the admin role and rendered inside
 * AdminShell — a separate full-bleed panel (see admin-shell.tsx) rather
 * than the public AppShell.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
