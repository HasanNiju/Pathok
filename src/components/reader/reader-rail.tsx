"use client";

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
  Volume2,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface ReaderRailProps {
  isBookmarked: boolean;
  isFullscreen: boolean;
  chromeColors: { chrome: string; border: string; fg: string; muted: string; accent: string };
  onBack: () => void;
  onToggleToc: () => void;
  onToggleSearch: () => void;
  onToggleBookmark: () => void;
  onToggleAnnotations: () => void;
  onToggleSettings: () => void;
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
      style={{ color: active ? accent : fg }}
    >
      {children}
    </button>
  );
}

export function ReaderRail({
  isBookmarked,
  isFullscreen,
  chromeColors,
  onBack,
  onToggleToc,
  onToggleSearch,
  onToggleBookmark,
  onToggleAnnotations,
  onToggleSettings,
  onToggleTts,
  onToggleFullscreen,
}: ReaderRailProps) {
  const { t } = useTranslation();

  return (
    <aside
      className="relative z-20 hidden w-16 shrink-0 flex-col items-center border-r py-4 md:flex"
      style={{ backgroundColor: chromeColors.chrome, borderColor: chromeColors.border }}
    >
      <RailButton label={t("common.close")} onClick={onBack} accent={chromeColors.accent} fg={chromeColors.fg}>
        <ArrowLeft className="h-[19px] w-[19px]" aria-hidden="true" />
      </RailButton>

      <div className="my-3 h-px w-8 shrink-0" style={{ backgroundColor: chromeColors.border }} />

      <div className={cn("flex flex-col items-center gap-1")}>
        <RailButton label={t("reader.actions.toc")} onClick={onToggleToc} accent={chromeColors.accent} fg={chromeColors.fg}>
          <List className="h-[19px] w-[19px]" aria-hidden="true" />
        </RailButton>
        <RailButton label={t("reader.actions.search")} onClick={onToggleSearch} accent={chromeColors.accent} fg={chromeColors.fg}>
          <Search className="h-[19px] w-[19px]" aria-hidden="true" />
        </RailButton>
        <RailButton
          label={isBookmarked ? t("reader.actions.removeBookmark") : t("reader.actions.addBookmark")}
          onClick={onToggleBookmark}
          active={isBookmarked}
          accent={chromeColors.accent}
          fg={chromeColors.fg}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-[19px] w-[19px]" aria-hidden="true" />
          ) : (
            <Bookmark className="h-[19px] w-[19px]" aria-hidden="true" />
          )}
        </RailButton>
        <RailButton
          label={t("reader.actions.annotations")}
          onClick={onToggleAnnotations}
          accent={chromeColors.accent}
          fg={chromeColors.fg}
        >
          <Highlighter className="h-[19px] w-[19px]" aria-hidden="true" />
        </RailButton>
        <RailButton label={t("reader.tts.title")} onClick={onToggleTts} accent={chromeColors.accent} fg={chromeColors.fg}>
          <Volume2 className="h-[19px] w-[19px]" aria-hidden="true" />
        </RailButton>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1">
        <RailButton
          label={t("reader.actions.settings")}
          onClick={onToggleSettings}
          accent={chromeColors.accent}
          fg={chromeColors.fg}
        >
          <Settings2 className="h-[19px] w-[19px]" aria-hidden="true" />
        </RailButton>
        <RailButton
          label={isFullscreen ? t("reader.actions.exitFullscreen") : t("reader.actions.fullscreen")}
          onClick={onToggleFullscreen}
          accent={chromeColors.accent}
          fg={chromeColors.fg}
        >
          {isFullscreen ? (
            <Minimize className="h-[19px] w-[19px]" aria-hidden="true" />
          ) : (
            <Maximize className="h-[19px] w-[19px]" aria-hidden="true" />
          )}
        </RailButton>
      </div>
    </aside>
  );
}
