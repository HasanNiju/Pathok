import type { Metadata } from "next";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const metadata: Metadata = { title: "User Management — Pathok" };

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
