"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminNav } from "@/components/admin/admin-nav";
import { Drawer } from "@/components/ui/drawer";
import { useTranslation } from "@/hooks/use-translation";

interface AdminShellProps {
  children: ReactNode;
}

/**
 * Layout frame for the whole /admin section: sidebar + topbar + content.
 * Renders full-bleed above the public AppShell (fixed inset-0, same
 * technique as ReaderView) so the admin panel reads as its own separate
 * surface without touching the shared shell/sidebar/topbar/footer.
 */
export function AdminShell({ children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      <AdminSidebar />

      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        title={t("admin.nav.menu")}
        side="left"
        className="max-w-[16rem]"
      >
        <AdminNav onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminTopbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
