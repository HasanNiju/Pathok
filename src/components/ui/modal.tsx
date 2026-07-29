"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Keep this component mounted in the tree and toggle `open` — it manages
 * its own AnimatePresence internally so exit animations play correctly.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card shadow-soft-lg",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-lg font-bold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="px-6 py-4">{children}</div>

            {footer && (
              <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
