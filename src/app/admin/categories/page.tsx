import { LayoutGrid } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

/** Reserved for a future Category Management module. */
export default function AdminCategoriesPage() {
  return <AdminPlaceholder icon={LayoutGrid} titleKey="admin.nav.categories" subtitleKey="admin.categories.subtitle" />;
}
