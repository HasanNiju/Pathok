import { Settings } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

/** Reserved for a future Admin Settings module. */
export default function AdminSettingsPage() {
  return <AdminPlaceholder icon={Settings} titleKey="admin.nav.settings" subtitleKey="admin.settings.subtitle" />;
}
