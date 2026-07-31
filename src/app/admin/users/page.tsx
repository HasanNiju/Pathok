import { Users } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

/** Reserved for a future User Management module. */
export default function AdminUsersPage() {
  return <AdminPlaceholder icon={Users} titleKey="admin.nav.users" subtitleKey="admin.users.subtitle" />;
}
