import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = { title: "Admin Dashboard — Pathok" };

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
