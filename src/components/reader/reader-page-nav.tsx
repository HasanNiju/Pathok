"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface ReaderPageNavProps {
  visible: boolean;
  chromeColors: { chrome: string; border: string; fg: string };
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

function NavButton({
  side,
  label,
  disabled,
  onClick,
  chromeColors,
  children,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
  chromeColors: { chrome: string; border: string; fg: string };
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: disabled ? 0.25 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-transform duration-150 hover:scale-105 disabled:pointer-events-none sm:flex",
        side === "left" ? "left-2 md:left-4" : "right-2 md:right-4"
      )}
      style={{ backgroundColor: chromeColors.chrome, borderColor: chromeColors.border, color: chromeColors.fg }}
    >
      {children}
    </motion.button>
  );
}

export function ReaderPageNav({ visible, chromeColors, canGoPrev, canGoNext, onPrevPage, onNextPage }: ReaderPageNavProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {visible && (
        <>
          <NavButton
            side="left"
            label={t("reader.nav.previousPage")}
            disabled={!canGoPrev}
            onClick={onPrevPage}
            chromeColors={chromeColors}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </NavButton>
          <NavButton
            side="right"
            label={t("reader.nav.nextPage")}
            disabled={!canGoNext}
            onClick={onNextPage}
            chromeColors={chromeColors}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </NavButton>
        </>
      )}
    </AnimatePresence>
  );
}
