"use client";

import { AnimatePresence, motion } from "framer-motion";
import { List, Maximize, Minimize, Search, Volume2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslation } from "@/hooks/use-translation";

interface ReaderRailProps {
  visible: boolean;
  isFullscreen: boolean;
  chromeColors: { fg: string; muted: string; accent: string };
  onToggleToc: () => void;
  onToggleSearch: () => void;
  onToggleTts: () => void;
  onToggleFullscreen: () => void;
}

function RailButton({
  label,
  onClick,
  active,
  accent,
  fg,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  accent: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-opacity duration-150 hover:opacity-70 sm:h-9 sm:w-9"
      style={{ color: active ? accent : fg }}
    >
      {children}
    </button>
  );
}

/**
 * A slim, borderless column of icons — no background box, no divider line
 * — floating at the left edge the way a native app's rail sits directly on
 * the surface behind it, rather than as a bordered toolbar.
 */
export function ReaderRail({
  visible,
  isFullscreen,
  chromeColors,
  onToggleToc,
  onToggleSearch,
  onToggleTts,
  onToggleFullscreen,
}: ReaderRailProps) {
  const { t } = useTranslation();
  // The Fullscreen API is unreliable or entirely unsupported on most phone
  // browsers (notably iOS Safari), so the toggle is desktop/tablet-only —
  // showing it on phones was the stray "button that does nothing" people
  // were seeing there.
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="relative z-20 flex w-14 shrink-0 flex-col items-center justify-center gap-3 py-6 sm:w-14 sm:justify-start sm:gap-1 md:w-16"
          style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <RailButton label={t("reader.actions.toc")} onClick={onToggleToc} accent={chromeColors.accent} fg={chromeColors.muted}>
            <List className="h-[19px] w-[19px]" aria-hidden="true" />
          </RailButton>
          <RailButton label={t("reader.actions.search")} onClick={onToggleSearch} accent={chromeColors.accent} fg={chromeColors.muted}>
            <Search className="h-[19px] w-[19px]" aria-hidden="true" />
          </RailButton>
          <RailButton label={t("reader.tts.title")} onClick={onToggleTts} accent={chromeColors.accent} fg={chromeColors.muted}>
            <Volume2 className="h-[19px] w-[19px]" aria-hidden="true" />
          </RailButton>

          {!isMobile && (
            <div className="mt-auto">
              <RailButton
                label={isFullscreen ? t("reader.actions.exitFullscreen") : t("reader.actions.fullscreen")}
                onClick={onToggleFullscreen}
                accent={chromeColors.accent}
                fg={chromeColors.muted}
              >
                {isFullscreen ? (
                  <Minimize className="h-[19px] w-[19px]" aria-hidden="true" />
                ) : (
                  <Maximize className="h-[19px] w-[19px]" aria-hidden="true" />
                )}
              </RailButton>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
