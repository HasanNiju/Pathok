"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Settings, User, Moon, Sun, Monitor, Languages, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/constants";

const THEME_CYCLE = ["light", "dark", "system"] as const;

/** Quick-access card linking to full account settings, plus the two
 *  device-wide preferences (theme, language) surfaced right on the
 *  dashboard so switching them doesn't require a trip to the topbar. */
export function SettingsShortcutSection() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
  const activeLanguageLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label ?? "";

  return (
    <section id="settings" className="scroll-mt-24">
      <SectionHeader title={t("dashboard.settingsShortcut.title")} subtitle={t("dashboard.settingsShortcut.subtitle")} />

      <Card>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          <Link
            href="/account"
            className="flex items-center gap-3 p-4 transition-colors duration-200 hover:bg-secondary/60 sm:p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">{t("dashboard.settingsShortcut.account")}</span>
              <span className="text-xs text-muted-foreground">{t("dashboard.settingsShortcut.accountDescription")}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>

          {mounted && (
            <button
              type="button"
              onClick={cycleTheme}
              className="flex items-center gap-3 p-4 text-left transition-colors duration-200 hover:bg-secondary/60 sm:p-5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <ThemeIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">{t("dashboard.settingsShortcut.theme")}</span>
                <span className="text-xs text-muted-foreground">{t(`theme.${theme ?? "system"}`)}</span>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={cycleLanguage}
            className="flex items-center gap-3 p-4 text-left transition-colors duration-200 hover:bg-secondary/60 sm:p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Languages className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">{t("dashboard.settingsShortcut.language")}</span>
              <span className="text-xs text-muted-foreground">{activeLanguageLabel}</span>
            </div>
          </button>

          <div className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Settings className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-xs text-muted-foreground">{t("dashboard.settingsShortcut.moreComingSoon")}</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
