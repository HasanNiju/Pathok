"use client";

import { createContext } from "react";
import type { Language } from "@/types";
import en from "@/translations/en";

/** Dictionary shape — inferred once from English, mirrored by every other language. */
export type Dictionary = typeof en;

export interface TranslationContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Dictionary for the active language, for direct access if ever needed. */
  dictionary: Dictionary;
  /**
   * Resolves a dot-path key (e.g. "nav.home") to its string
   * in the active language. Components should never hardcode UI text —
   * they call t("some.key") instead.
   */
  t: (key: string) => string;
}

export const TranslationContext = createContext<TranslationContextValue | null>(null);
