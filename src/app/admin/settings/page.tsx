import type { Metadata } from "next";
import { AdminSettingsView } from "@/components/admin/admin-settings-view";

export const metadata: Metadata = { title: "Settings — Pathok" };

export default function AdminSettingsPage() {
  return <AdminSettingsView />;
}
