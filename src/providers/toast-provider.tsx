"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ToastContext, type ToastItem } from "@/context/toast-context";

const DEFAULT_DURATION_MS = 4000;

/**
 * Not yet wired into AppProviders (see app-providers.tsx from Module 01) —
 * this module builds the toast system as a standalone, reusable piece.
 * To activate it app-wide, wrap children with <ToastProvider> and mount
 * <Toaster /> once, near the root. Left as an explicit next step so this
 * module doesn't modify Module 01 files on its own.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => removeToast(id), DEFAULT_DURATION_MS);
      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
