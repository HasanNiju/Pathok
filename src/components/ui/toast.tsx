"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, type LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { ToastVariant } from "@/context/toast-context";

const ICONS: Record<ToastVariant, LucideIcon> = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

const ICON_COLOR: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-primary",
  error: "text-destructive",
  warning: "text-amber-500",
};

/**
 * Fixed-position stack rendering every active toast. Mount once, near the
 * root, alongside a <ToastProvider>. Requires useToast (see
 * providers/toast-provider.tsx for wiring instructions).
 */
export function Toaster() {
  const { toasts, removeToast } = useToast();
  const { t } = useTranslation();

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((toast) => {
          const variant = toast.variant ?? "default";
          const Icon = ICONS[variant];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-soft-lg"
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ICON_COLOR[variant])} aria-hidden="true" />

              <div className="flex-1">
                <p className="text-sm font-bold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label={t("common.dismiss")}
                className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
