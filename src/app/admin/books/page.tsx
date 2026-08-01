import type { Metadata } from "next";
import { AdminBooksView } from "@/components/admin/admin-books-view";

export const metadata: Metadata = { title: "Book Management — Pathok" };

export default function AdminBooksPage() {
  return <AdminBooksView />;
}
