"use client";

import { Minus, Plus } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LETTER_SPACING_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  MARGIN_OPTIONS,
  READER_THEMES,
} from "@/constants/reader";
import { cn } from "@/lib/utils";
import type { ReaderSettings } from "@/types/reader";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdate: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onReset: () => void;
}

function SegmentedGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200",
            value === option.value
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-transparent text-foreground hover:bg-secondary"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsPanel({
  open,
  onClose,
  settings,
  onUpdate,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onReset,
}: SettingsPanelProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onClose={onClose} title={t("reader.settings.title")} side="right" className="max-w-sm">
      <div className="flex flex-col gap-7">
        {/* Font size */}
        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold">{t("reader.settings.fontSize")}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDecreaseFontSize}
              disabled={settings.fontSize <= FONT_SIZE_MIN}
              aria-label="Decrease font size"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors duration-200 hover:bg-secondary disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex-1 text-center text-sm font-medium text-muted-foreground">{settings.fontSize}px</div>
            <button
              type="button"
              onClick={onIncreaseFontSize}
              disabled={settings.fontSize >= FONT_SIZE_MAX}
              aria-label="Increase font size"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors duration-200 hover:bg-secondary disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Font family */}
        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold">{t("reader.settings.fontFamily")}</p>
          <div className="grid grid-cols-3 gap-2">
            {FONT_FAMILY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate("fontFamily", option.value)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200",
                  option.sampleClass,
                  settings.fontFamily === option.value
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:bg-secondary"
                )}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </section>

        {/* Line height */}
        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold">{t("reader.settings.lineHeight")}</p>
          <SegmentedGroup
            options={LINE_HEIGHT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            value={settings.lineHeight}
            onChange={(value) => onUpdate("lineHeight", value)}
          />
        </section>

        {/* Letter spacing */}
        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold">{t("reader.settings.letterSpacing")}</p>
          <SegmentedGroup
            options={LETTER_SPACING_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            value={settings.letterSpacing}
            onChange={(value) => onUpdate("letterSpacing", value)}
          />
        </section>

        {/* Margins */}
        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold">{t("reader.settings.margins")}</p>
          <SegmentedGroup
            options={MARGIN_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            value={settings.margin}
            onChange={(value) => onUpdate("margin", value)}
          />
        </section>

        {/* Theme */}
        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold">{t("reader.settings.theme")}</p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(READER_THEMES) as [keyof typeof READER_THEMES, (typeof READER_THEMES)[keyof typeof READER_THEMES]][]).map(
              ([name, palette]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onUpdate("theme", name)}
                  aria-label={t(palette.labelKey)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors duration-200",
                    settings.theme === name ? "border-primary" : "border-border hover:bg-secondary"
                  )}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-bold"
                    style={{ backgroundColor: palette.bg, color: palette.fg, borderColor: palette.chromeBorder }}
                  >
                    Aa
                  </span>
                  <span className="text-[11px] font-medium">{t(palette.labelKey)}</span>
                </button>
              )
            )}
          </div>
        </section>

        <Button variant="outline" size="sm" onClick={onReset}>
          {t("reader.settings.reset")}
        </Button>
      </div>
    </Drawer>
  );
}
