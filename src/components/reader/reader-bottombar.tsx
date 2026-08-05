"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { WORDS_PER_MINUTE } from "@/constants/reader";

interface ReaderBottomBarProps {
  visible: boolean;
  chromeColors: { chrome: string; border: string; fg: string; muted: string; accent: string };
  pageIndex: number;
  totalPagesInChapter: number;
  chapterOrder: number;
  totalChapters: number;
  overallProgress: number;
  minutesSpent: number;
  remainingWords: number;
}

/**
 * A quiet caption floating on the desk beneath the book — not a toolbar.
 * No background or border, just small serif type, the way a printed
 * folio line sits under a page rather than inside a UI chrome bar.
 */
export function ReaderBottomBar({
  visible,
  chromeColors,
  pageIndex,
  totalPagesInChapter,
  chapterOrder,
  totalChapters,
  overallProgress,
  minutesSpent,
  remainingWords,
}: ReaderBottomBarProps) {
  const { t } = useTranslation();
  const minutesLeft = Math.max(1, Math.round(remainingWords / WORDS_PER_MINUTE));

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-20 flex flex-col items-center gap-1.5 px-4 pb-4 pt-1 text-center sm:gap-1 sm:px-3"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <p className="text-sm" style={{ color: chromeColors.muted }}>
            {pageIndex + 1} / {totalPagesInChapter}
          </p>
          <p className="text-[11px] sm:text-[10.5px]" style={{ color: chromeColors.muted, opacity: 0.7 }}>
            {t("reader.progress.chapterOf")
              .replace("{current}", String(chapterOrder))
              .replace("{total}", String(totalChapters))}
            {" · "}
            {t("reader.progress.percentComplete").replace("{percent}", String(overallProgress))}
            {" · "}
            {t("reader.progress.timeLeft").replace("{minutes}", String(minutesLeft))}
            {minutesSpent > 0 && (
              <>
                {" · "}
                {t("reader.progress.timeSpent").replace("{minutes}", String(minutesSpent))}
              </>
            )}
          </p>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}
