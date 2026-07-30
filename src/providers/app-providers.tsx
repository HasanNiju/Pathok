"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { TranslationProvider } from "@/providers/translation-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toast";

/**
 * Single composition point for every app-wide provider. The root layout
 * only ever imports this — new global providers get added here, not
 * scattered across layout.tsx.
 *
 * ToastProvider existed since Module 02 but was left unmounted there
 * (see providers/toast-provider.tsx); the Auth module activates it here
 * since login/signup/OTP flows need toast feedback. <Toaster /> is mounted
 * once, inside the provider, so any page can call useToast().
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <ToastProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ToastProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
