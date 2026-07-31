"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_READER_SETTINGS, FONT_SIZE_MAX, FONT_SIZE_MIN, FONT_SIZE_STEP, READER_STORAGE_KEYS } from "@/constants/reader";
import type { ReaderSettings } from "@/types/reader";

function readSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_READER_SETTINGS;
  try {
    const raw = window.localStorage.getItem(READER_STORAGE_KEYS.settings);
    if (!raw) return DEFAULT_READER_SETTINGS;
    return { ...DEFAULT_READER_SETTINGS, ...(JSON.parse(raw) as Partial<ReaderSettings>) };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

/**
 * Font size, family, line height, letter spacing, margins, and reader
 * theme — persisted device-wide (not per-book), same spirit as the app's
 * own theme/language preferences. Starts from defaults on the server and
 * syncs to localStorage after mount to avoid hydration mismatches.
 */
export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSettings(readSettings());
    setIsHydrated(true);
  }, []);

  const persist = useCallback((next: ReaderSettings) => {
    setSettings(next);
    try {
      window.localStorage.setItem(READER_STORAGE_KEYS.settings, JSON.stringify(next));
    } catch {
      // Best-effort — reading still works this session even if storage is unavailable.
    }
  }, []);

  const update = useCallback(
    <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
      persist({ ...settings, [key]: value });
    },
    [settings, persist]
  );

  const increaseFontSize = useCallback(() => {
    persist({ ...settings, fontSize: Math.min(FONT_SIZE_MAX, settings.fontSize + FONT_SIZE_STEP) });
  }, [settings, persist]);

  const decreaseFontSize = useCallback(() => {
    persist({ ...settings, fontSize: Math.max(FONT_SIZE_MIN, settings.fontSize - FONT_SIZE_STEP) });
  }, [settings, persist]);

  const reset = useCallback(() => persist(DEFAULT_READER_SETTINGS), [persist]);

  return { settings, isHydrated, update, increaseFontSize, decreaseFontSize, reset };
}
