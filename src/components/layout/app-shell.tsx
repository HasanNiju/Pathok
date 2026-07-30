"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, SidebarNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { Drawer } from "@/components/ui/drawer";
import { useTranslation } from "@/hooks/use-translation";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Top-level layout frame: sidebar + topbar + main content region + footer.
 * Every future page renders inside this shell via the root layout —
 * pages themselves should never re-implement this structure.
 *
 * Navigation below the md breakpoint lives in a Drawer instead of the
 * persistent Sidebar; this component owns the open/closed state so the
 * Topbar's menu button and the drawer can share it.
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex flex-1">
        <Sidebar />

        <Drawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          title={t("nav.menu")}
          side="left"
          className="max-w-[16rem]"
        >
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </Drawer>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
