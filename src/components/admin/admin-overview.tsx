import { AdminOverviewHeader } from "@/components/admin/admin-overview-header";
import { AdminStatsSection } from "@/components/admin/admin-stats-section";
import { AdminRecentBooksSection } from "@/components/admin/admin-recent-books-section";
import { AdminQuickActionsSection } from "@/components/admin/admin-quick-actions-section";

/** Dashboard Overview — the /admin landing page: greeting, dummy stats,
 *  recent books, and quick actions, per the module PRD. */
export function AdminOverview() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-12">
      <AdminOverviewHeader />
      <AdminStatsSection />
      <AdminRecentBooksSection />
      <AdminQuickActionsSection />
    </div>
  );
}
