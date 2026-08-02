import type {
  ReaderFontFamily,
  ReaderLetterSpacing,
  ReaderLineHeight,
  ReaderMargin,
  ReaderSettings,
  ReaderThemeName,
} from "@/types/reader";

/** localStorage keys for everything the Reader module persists. Prefixes
 *  are joined with a userId/bookId by the hook that owns them, matching
 *  the pattern STORAGE_KEYS already uses in @/constants for favorites. */
export const READER_STORAGE_KEYS = {
  /** Device-wide, like the app theme — not scoped to a user or book. */
  settings: "pathok:reader-settings",
  /** Joined with `:${userId}:${bookId}`. */
  session: "pathok:reader-session",
  bookmarks: "pathok:reader-bookmarks",
  annotations: "pathok:reader-annotations",
} as const;

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  fontFamily: "serif",
  lineHeight: "comfortable",
  letterSpacing: "normal",
  margin: "comfortable",
  theme: "light",
};

export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 28;
export const FONT_SIZE_STEP = 1;

export const FONT_FAMILY_OPTIONS: { value: ReaderFontFamily; labelKey: string; sampleClass: string }[] = [
  { value: "sans", labelKey: "reader.settings.fontFamilyOptions.sans", sampleClass: "font-sans" },
  { value: "serif", labelKey: "reader.settings.fontFamilyOptions.serif", sampleClass: "font-serif" },
  { value: "literary", labelKey: "reader.settings.fontFamilyOptions.literary", sampleClass: "font-literary" },
];

export const LINE_HEIGHT_OPTIONS: { value: ReaderLineHeight; labelKey: string; ratio: number }[] = [
  { value: "compact", labelKey: "reader.settings.lineHeightOptions.compact", ratio: 1.4 },
  { value: "comfortable", labelKey: "reader.settings.lineHeightOptions.comfortable", ratio: 1.7 },
  { value: "relaxed", labelKey: "reader.settings.lineHeightOptions.relaxed", ratio: 2.0 },
  { value: "spacious", labelKey: "reader.settings.lineHeightOptions.spacious", ratio: 2.3 },
];

export const LETTER_SPACING_OPTIONS: { value: ReaderLetterSpacing; labelKey: string; em: number }[] = [
  { value: "normal", labelKey: "reader.settings.letterSpacingOptions.normal", em: 0 },
  { value: "wide", labelKey: "reader.settings.letterSpacingOptions.wide", em: 0.02 },
  { value: "wider", labelKey: "reader.settings.letterSpacingOptions.wider", em: 0.04 },
];

export const MARGIN_OPTIONS: { value: ReaderMargin; labelKey: string; remDesktop: number; remMobile: number }[] = [
  { value: "narrow", labelKey: "reader.settings.marginOptions.narrow", remDesktop: 3, remMobile: 1 },
  { value: "comfortable", labelKey: "reader.settings.marginOptions.comfortable", remDesktop: 6, remMobile: 1.5 },
  { value: "wide", labelKey: "reader.settings.marginOptions.wide", remDesktop: 10, remMobile: 2 },
];

/** Reader color themes — deliberately plain hex, not Tailwind/HSL tokens,
 *  because these are independent of the app's own light/dark theme and
 *  need to look right (e.g. true sepia) regardless of it. Applied via
 *  inline CSS custom properties on the reader's root element only.
 *
 *  `bg` is the page/paper color; `desk` is the surrounding surface the
 *  page rests on (visible as the margin around the book on wide screens);
 *  `spine` is the shadow tone used for the center gutter of a two-page
 *  spread. Chrome (topbar/rail) stays a separate, app-toolbar-ish color. */
export const READER_THEMES: Record<
  ReaderThemeName,
  {
    bg: string;
    fg: string;
    muted: string;
    chrome: string;
    chromeBorder: string;
    desk: string;
    spine: string;
    labelKey: string;
  }
> = {
  light: {
    bg: "#FCFBF8",
    fg: "#1F2328",
    muted: "#6B7280",
    chrome: "#FFFFFF",
    chromeBorder: "#E5E7EB",
    desk: "#E9E6DE",
    spine: "rgba(31, 28, 20, 0.16)",
    labelKey: "reader.theme.light",
  },
  dark: {
    bg: "#1A1C1F",
    fg: "#E7E9EC",
    muted: "#9AA1AB",
    chrome: "#1D2024",
    chromeBorder: "#2C3036",
    desk: "#0C0D0F",
    spine: "rgba(0, 0, 0, 0.6)",
    labelKey: "reader.theme.dark",
  },
  sepia: {
    bg: "#F4E9D3",
    fg: "#3B2F20",
    muted: "#8A7960",
    chrome: "#E9DBC0",
    chromeBorder: "#D9C7A3",
    desk: "#DBC9A2",
    spine: "rgba(59, 47, 32, 0.28)",
    labelKey: "reader.theme.sepia",
  },
  night: {
    bg: "#020202",
    fg: "#C7C9CC",
    muted: "#6E7075",
    chrome: "#0A0A0B",
    chromeBorder: "#1C1C1E",
    desk: "#000000",
    spine: "rgba(255, 255, 255, 0.06)",
    labelKey: "reader.theme.night",
  },
};

/** Average adult silent-reading speed, used to estimate time remaining. */
export const WORDS_PER_MINUTE = 220;

export const ANNOTATION_COLOR_HEX: Record<string, string> = {
  yellow: "#FDE68A",
  green: "#BBF7D0",
  blue: "#BFDBFE",
  pink: "#FBCFE8",
};
