import type { Language } from "@/types";

/** Display name used anywhere the product name appears in the UI/shell. */
export const APP_NAME = "Pathok";

/** Languages the translation system supports, in menu order. */
export const SUPPORTED_LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
];

export const DEFAULT_LANGUAGE: Language = "en";

/** localStorage keys — centralized so no module hardcodes a raw string key. */
export const STORAGE_KEYS = {
  language: "pathok:language",
  theme: "pathok:theme",
} as const;

/** Shared breakpoints for hooks/components that need to branch on viewport. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
