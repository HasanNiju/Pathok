"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export type DrawerSide = "left" | "right" | "bottom";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: DrawerSide;
  children: ReactNode;
  className?: string;
}

const SIDE_VARIANTS: Record<DrawerSide, { hidden: Record<string, string>; visible: Record<string, string> }> = {
  left: { hidden: { x: "-100%" }, visible: { x: "0%" } },
  right: { hidden: { x: "100%" }, visible: { x: "0%" } },
  bottom: { hidden: { y: "100%" }, visible: { y: "0%" } },
};

const SIDE_POSITION: Record<DrawerSide, string> = {
  left: "left-0 top-0 h-full w-full max-w-sm border-r",
  right: "right-0 top-0 h-full w-full max-w-sm border-l",
  bottom: "bottom-0 left-0 max-h-[85vh] w-full rounded-t-2xl border-t",
};

export function Drawer({ open, onClose, title, side = "right", children, className }: DrawerProps) {
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

  const variant = SIDE_VARIANTS[side];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
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
            initial={variant.hidden}
            animate={variant.visible}
            exit={variant.hidden}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "absolute flex flex-col border-border bg-card shadow-soft-lg",
              SIDE_POSITION[side],
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

            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
