"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { TranslationContext, type Dictionary } from "@/context/translation-context";
import type { Language } from "@/types";
import { DEFAULT_LANGUAGE, STORAGE_KEYS } from "@/constants";
import en from "@/translations/en";
import bn from "@/translations/bn";

const dictionaries: Record<Language, Dictionary> = { en, bn };

/** Reads a dot-path (e.g. "nav.home") off a nested dictionary object. */
function resolveKey(dictionary: Dictionary, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, dictionary);

  return typeof value === "string" ? value : key;
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // Restore persisted language preference on mount (client-only).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.language) as Language | null;
    if (stored === "en" || stored === "bn") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEYS.language, next);
  }, []);

  const dictionary = dictionaries[language];

  const t = useCallback((key: string) => resolveKey(dictionary, key), [dictionary]);

  const value = useMemo(
    () => ({ language, setLanguage, dictionary, t }),
    [language, setLanguage, dictionary, t]
  );

  return (
    <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
  );
}
