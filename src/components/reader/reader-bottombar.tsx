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
 * Minimal centered footer — just the page count, like a printed book's
 * folio line. Page-turning lives in the floating edge arrows / rail now,
 * so this bar carries only progress information, not controls.
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
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-20 flex flex-col items-center gap-0.5 border-t px-3 py-3 text-center"
          style={{ backgroundColor: chromeColors.chrome, borderColor: chromeColors.border, color: chromeColors.fg }}
        >
          <p className="text-xs font-semibold tracking-wide">
            {t("reader.progress.pageOf")
              .replace("{current}", String(pageIndex + 1))
              .replace("{total}", String(totalPagesInChapter))}
            <span className="mx-1.5" style={{ color: chromeColors.muted }}>
              ·
            </span>
            <span style={{ color: chromeColors.muted }}>
              {t("reader.progress.chapterOf")
                .replace("{current}", String(chapterOrder))
                .replace("{total}", String(totalChapters))}
            </span>
          </p>
          <p className="text-[11px]" style={{ color: chromeColors.muted }}>
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
