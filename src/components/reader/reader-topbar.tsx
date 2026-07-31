"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Highlighter,
  List,
  Maximize,
  Minimize,
  Search,
  Settings2,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface ReaderTopBarProps {
  visible: boolean;
  bookTitle: string;
  chapterTitle: string;
  isBookmarked: boolean;
  isFullscreen: boolean;
  chromeColors: { chrome: string; border: string; fg: string; muted: string };
  onBack: () => void;
  onToggleToc: () => void;
  onToggleSearch: () => void;
  onToggleBookmark: () => void;
  onToggleAnnotations: () => void;
  onToggleSettings: () => void;
  onToggleFullscreen: () => void;
}

function IconButton({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10",
        active && "text-primary"
      )}
    >
      {children}
    </button>
  );
}

export function ReaderTopBar({
  visible,
  bookTitle,
  chapterTitle,
  isBookmarked,
  isFullscreen,
  chromeColors,
  onBack,
  onToggleToc,
  onToggleSearch,
  onToggleBookmark,
  onToggleAnnotations,
  onToggleSettings,
  onToggleFullscreen,
}: ReaderTopBarProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-20 flex items-center gap-2 border-b px-3 py-2 sm:px-5"
          style={{ backgroundColor: chromeColors.chrome, borderColor: chromeColors.border, color: chromeColors.fg }}
        >
          <IconButton label={t("common.close")} onClick={onBack}>
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
          </IconButton>

          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-sm font-bold leading-tight">{bookTitle}</p>
            <p className="truncate text-xs leading-tight" style={{ color: chromeColors.muted }}>
              {chapterTitle}
            </p>
          </div>

          <div className="flex items-center gap-0.5">
            <IconButton label={t("reader.actions.toc")} onClick={onToggleToc}>
              <List className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>
            <IconButton label={t("reader.actions.search")} onClick={onToggleSearch}>
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>
            <IconButton
              label={isBookmarked ? t("reader.actions.removeBookmark") : t("reader.actions.addBookmark")}
              onClick={onToggleBookmark}
              active={isBookmarked}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </IconButton>
            <IconButton label={t("reader.actions.annotations")} onClick={onToggleAnnotations}>
              <Highlighter className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>
            <IconButton label={t("reader.actions.settings")} onClick={onToggleSettings}>
              <Settings2 className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>
            <IconButton
              label={isFullscreen ? t("reader.actions.exitFullscreen") : t("reader.actions.fullscreen")}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Maximize className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </IconButton>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
