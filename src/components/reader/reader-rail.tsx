"use client";

import { List, Maximize, Minimize, Search, Volume2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ReaderRailProps {
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-opacity duration-150 hover:opacity-70"
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
  isFullscreen,
  chromeColors,
  onToggleToc,
  onToggleSearch,
  onToggleTts,
  onToggleFullscreen,
}: ReaderRailProps) {
  const { t } = useTranslation();

  return (
    <aside className="relative z-20 flex w-14 shrink-0 flex-col items-center gap-1 py-6 sm:w-16">
      <RailButton label={t("reader.actions.toc")} onClick={onToggleToc} accent={chromeColors.accent} fg={chromeColors.muted}>
        <List className="h-[19px] w-[19px]" aria-hidden="true" />
      </RailButton>
      <RailButton label={t("reader.actions.search")} onClick={onToggleSearch} accent={chromeColors.accent} fg={chromeColors.muted}>
        <Search className="h-[19px] w-[19px]" aria-hidden="true" />
      </RailButton>
      <RailButton label={t("reader.tts.title")} onClick={onToggleTts} accent={chromeColors.accent} fg={chromeColors.muted}>
        <Volume2 className="h-[19px] w-[19px]" aria-hidden="true" />
      </RailButton>

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
    </aside>
  );
}
