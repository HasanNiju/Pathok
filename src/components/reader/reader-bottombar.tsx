"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

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
  canGoPrev,
  canGoNext,
  onPrevPage,
  onNextPage,
}: ReaderBottomBarProps) {
  const { t } = useTranslation();
  const minutesLeft = Math.max(1, Math.round(remainingWords / WORDS_PER_MINUTE));

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 72, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-20 border-t px-3 py-2.5 sm:px-5"
          style={{ backgroundColor: chromeColors.chrome, borderColor: chromeColors.border, color: chromeColors.fg }}
        >
          {/* Thin overall progress line */}
          <div className="mb-2.5 h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: chromeColors.border }}>
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%`, backgroundColor: chromeColors.accent }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={!canGoPrev}
              aria-label={t("reader.nav.previousPage")}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
              <p className="truncate text-xs font-medium" style={{ color: chromeColors.fg }}>
                {t("reader.progress.pageOf")
                  .replace("{current}", String(pageIndex + 1))
                  .replace("{total}", String(totalPagesInChapter))}
                {" · "}
                {t("reader.progress.chapterOf")
                  .replace("{current}", String(chapterOrder))
                  .replace("{total}", String(totalChapters))}
              </p>
              <p className="truncate text-[11px]" style={{ color: chromeColors.muted }}>
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
            </div>

            <button
              type="button"
              onClick={onNextPage}
              disabled={!canGoNext}
              aria-label={t("reader.nav.nextPage")}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}
