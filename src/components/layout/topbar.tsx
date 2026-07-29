"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Languages } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/constants";
import { cn } from "@/lib/utils";

interface TopbarProps {
  className?: string;
}

const THEME_CYCLE = ["light", "dark", "system"] as const;

/**
 * Structural placeholder for the top bar. Only global, app-wide controls
 * live here (brand mark, theme toggle, language switcher) — page-specific
 * actions will be added by the modules that own those pages.
 */
export function Topbar({ className }: TopbarProps) {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid rendering theme-dependent UI until mounted, to prevent
  // server/client mismatch (next-themes resolves actual theme client-side).
  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    const current = (theme as (typeof THEME_CYCLE)[number]) ?? "system";
    const nextIndex = (THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex] ?? "system");
  };

  const cycleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === language);
    const next = SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
    setLanguage(next?.code ?? DEFAULT_LANGUAGE);
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-center justify-between border-b border-border bg-background/80 backdrop-blur",
        "px-4 py-4 sm:px-6",
        className
      )}
    >
      <span className="text-lg font-bold tracking-tight">
        {t("shell.topbarPlaceholder")}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={cycleLanguage}
          aria-label={t("language.label")}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md",
            "text-muted-foreground hover:bg-secondary hover:text-foreground",
            "transition-colors duration-200"
          )}
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
        </button>

        {mounted && (
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={t("theme.light")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-secondary hover:text-foreground",
              "transition-colors duration-200"
            )}
          >
            <ThemeIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.header>
  );
}
