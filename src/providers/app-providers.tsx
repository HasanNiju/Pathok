"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { TranslationProvider } from "@/providers/translation-provider";

/**
 * Single composition point for every app-wide provider. The root layout
 * only ever imports this — new global providers get added here, not
 * scattered across layout.tsx.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TranslationProvider>{children}</TranslationProvider>
    </ThemeProvider>
  );
}
