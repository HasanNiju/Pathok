import { AdminCategoriesView } from "@/components/admin/admin-categories-view";

/** Category Management (Module 09) — create, edit, delete, activate/deactivate,
 *  search, and list book categories. See src/hooks/use-categories.ts for the
 *  underlying CRUD/persistence and src/components/ui/category-select.tsx for
 *  the picker the future Book Creation module reuses. */
export default function AdminCategoriesPage() {
  return <AdminCategoriesView />;
}
