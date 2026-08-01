import type { Metadata } from "next";
import { AdminBrandingView } from "@/components/admin/admin-branding-view";

export const metadata: Metadata = { title: "Branding — Pathok" };

export default function AdminBrandingPage() {
  return <AdminBrandingView />;
}
