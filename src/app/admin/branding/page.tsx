import { Palette } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

/** Reserved for a future Branding module (logo, colors, app copy). */
export default function AdminBrandingPage() {
  return <AdminPlaceholder icon={Palette} titleKey="admin.nav.branding" subtitleKey="admin.branding.subtitle" />;
}
