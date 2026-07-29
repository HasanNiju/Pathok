"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Home, Library, Sparkles, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const items = [
  { key: "home.nav.home", icon: Home, href: "/" },
  { key: "home.nav.discover", icon: Compass, href: "/" },
  { key: "home.nav.library", icon: Library, href: "/" },
  { key: "home.nav.settings", icon: Settings, href: "/account" },
] as const;

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border bg-card/80",
        "px-6 py-8 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t("app.name")}</p>
          <p className="text-xs text-muted-foreground">{t("home.sidebar.subtitle")}</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2" aria-label={t("shell.sidebarPlaceholder")}>
        {items.map(({ key, icon: Icon, href }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              key === "home.nav.home"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t(key)}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-secondary/70 p-4">
        <p className="text-sm font-semibold text-foreground">{t("home.sidebar.cardTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("home.sidebar.cardDescription")}</p>
      </div>
    </motion.aside>
  );
}
