"use client";

import { useContext } from "react";
import { TranslationContext } from "@/context/translation-context";

/**
 * Access active language, the language setter, and the t() key resolver.
 * Must be called from within <TranslationProvider> (provided in AppProviders).
 */
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
}
