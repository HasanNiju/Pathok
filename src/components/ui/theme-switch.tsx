"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const OPTIONS: { value: "light" | "dark" | "system"; icon: LucideIcon }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export interface ThemeSwitchProps {
  className?: string;
}

/**
 * Reusable segmented theme control. This is a design-system version of the
 * inline logic already living in components/layout/topbar.tsx (Module 01,
 * left untouched) — future modules can swap to this one for a richer,
 * three-option control instead of the cycling icon button.
 */
export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-secondary p-1",
        className
      )}
    >
      {OPTIONS.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={t(`theme.${value}`)}
          aria-pressed={theme === value}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200",
            theme === value
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
