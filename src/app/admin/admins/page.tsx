import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminManagementView } from "@/components/admin/admin-management-view";

export const metadata: Metadata = { title: "Admin Management — Pathok" };

/** Nested inside the already-admin-gated /admin layout, further restricted
 *  to Super Admin only (Module 04). */
export default function AdminAdminsPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <AdminManagementView />
    </ProtectedRoute>
  );
}
