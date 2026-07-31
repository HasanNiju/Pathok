"use client";

import { useTranslation } from "@/hooks/use-translation";

const SECTIONS = [
  "statistics",
  "continue-reading",
  "reading-progress",
  "reading-history",
  "completed-books",
  "bookmarks",
  "favorites",
  "achievements",
  "settings",
] as const;

/** Horizontally scrollable jump-links, one per dashboard section — same
 *  anchor-link pattern the app-wide Sidebar already uses for Home's rails
 *  (e.g. /#continue-reading), just scoped to this page's own sections. */
export function DashboardSubnav() {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("dashboard.subnavLabel")}
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {SECTIONS.map((section) => (
        <a
          key={section}
          href={`#${section}`}
          className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
        >
          {t(`dashboard.sections.${section}`)}
        </a>
      ))}
    </nav>
  );
}
