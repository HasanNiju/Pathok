"use client";

import { Languages } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { useTranslation } from "@/hooks/use-translation";
import { SUPPORTED_LANGUAGES } from "@/constants";
import { cn } from "@/lib/utils";

export interface LanguageSwitchProps {
  className?: string;
}

/**
 * Reusable language switcher built on the Dropdown primitive. A
 * design-system alternative to the inline cycling button already in
 * components/layout/topbar.tsx (Module 01, left untouched).
 */
export function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { language, setLanguage, t } = useTranslation();
  const current = SUPPORTED_LANGUAGES.find((entry) => entry.code === language);

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          aria-label={t("language.label")}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground",
            className
          )}
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          {current?.label}
        </button>
      }
      items={SUPPORTED_LANGUAGES.map((entry) => ({
        label: entry.label,
        onSelect: () => setLanguage(entry.code),
      }))}
    />
  );
}
