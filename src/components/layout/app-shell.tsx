import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Top-level layout frame: sidebar + topbar + main content region.
 * Every future page renders inside this shell via the root layout —
 * pages themselves should never re-implement this structure.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-5 py-10 sm:px-7 sm:py-12 lg:px-10 lg:py-14">{children}</main>
      </div>
    </div>
  );
}
