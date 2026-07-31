/**
 * Dashboard-module-owned domain types.
 * Foundation types live in @/types, the catalog shape (Book, ReadingProgress)
 * lives in @/types/book — this file only adds what the User Dashboard page
 * introduces: aggregated stats, the unified history timeline, and achievements.
 * Nothing here is persisted directly — it's all derived at read-time from
 * data the Auth/Home/Book Details/Reader modules already store.
 */

/** One row in the Reading History timeline — a book the user has opened at
 *  least once, merging the seeded dummy progress with any live Reader
 *  session found in localStorage (the live session always wins). */
export interface ReadingHistoryEntry {
  bookId: string;
  /** 0–100. */
  progress: number;
  /** ISO date/timestamp of the most recent activity on this book. */
  lastReadAt: string;
  /** Minutes spent reading this title, when known (live sessions only). */
  minutesSpent?: number;
  isCompleted: boolean;
  /** True when this entry came from an actual Reader session rather than seed data. */
  isLive: boolean;
}

/** Aggregated numbers backing the Statistics section and the dashboard header. */
export interface DashboardStats {
  booksStarted: number;
  booksInProgress: number;
  booksCompleted: number;
  favoritesCount: number;
  bookmarksCount: number;
  /** Sum of minutesSpent across live sessions, plus a progress-based estimate for seed-only entries. */
  totalMinutes: number;
  /** Distinct category slugs touched across every started book. */
  categoriesExplored: number;
  /** Mean progress across every started (non-completed-only) book, 0–100. */
  averageProgress: number;
}

/** A single unlockable badge. `check` is evaluated against live stats to
 *  decide whether it's earned — definitions live in @/constants/dashboard. */
export interface AchievementDefinition {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  /** Target value the relevant stat must reach to unlock this badge. */
  target: number;
  /** Which stat (or derived count) this badge tracks, for progress display. */
  metric: keyof DashboardStats;
}

/** A definition paired with the user's live progress toward it. */
export interface AchievementProgress extends AchievementDefinition {
  currentValue: number;
  isEarned: boolean;
}
