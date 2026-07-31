import { BookOpen } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

/** Reserved for a future Book Management module (edit/remove catalog titles). */
export default function AdminBooksPage() {
  return <AdminPlaceholder icon={BookOpen} titleKey="admin.nav.books" subtitleKey="admin.books.subtitle" />;
}
