import { ProtectedRoute } from "@/components/auth";
import { DashboardView } from "@/components/dashboard";

/**
 * User Dashboard module. Any signed-in role (user or admin) can view their
 * own dashboard — same auth gating as /account, just a richer page.
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  );
}
