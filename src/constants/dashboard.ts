import type { AchievementDefinition } from "@/types/dashboard";

/**
 * Badge definitions for the Achievements section. Deliberately static and
 * small — thresholds are tuned against the seeded dummy data (see
 * data/reading-progress.json) so a fresh demo account can realistically
 * earn a few of these, not zero and not all.
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first-page",
    icon: "BookOpen",
    titleKey: "dashboard.achievements.items.firstPage.title",
    descriptionKey: "dashboard.achievements.items.firstPage.description",
    target: 1,
    metric: "booksStarted",
  },
  {
    id: "first-finish",
    icon: "PartyPopper",
    titleKey: "dashboard.achievements.items.firstFinish.title",
    descriptionKey: "dashboard.achievements.items.firstFinish.description",
    target: 1,
    metric: "booksCompleted",
  },
  {
    id: "bookworm",
    icon: "Library",
    titleKey: "dashboard.achievements.items.bookworm.title",
    descriptionKey: "dashboard.achievements.items.bookworm.description",
    target: 5,
    metric: "booksCompleted",
  },
  {
    id: "avid-reader",
    icon: "Flame",
    titleKey: "dashboard.achievements.items.avidReader.title",
    descriptionKey: "dashboard.achievements.items.avidReader.description",
    target: 300,
    metric: "totalMinutes",
  },
  {
    id: "explorer",
    icon: "Compass",
    titleKey: "dashboard.achievements.items.explorer.title",
    descriptionKey: "dashboard.achievements.items.explorer.description",
    target: 3,
    metric: "categoriesExplored",
  },
  {
    id: "curator",
    icon: "Heart",
    titleKey: "dashboard.achievements.items.curator.title",
    descriptionKey: "dashboard.achievements.items.curator.description",
    target: 5,
    metric: "favoritesCount",
  },
  {
    id: "collector",
    icon: "Bookmark",
    titleKey: "dashboard.achievements.items.collector.title",
    descriptionKey: "dashboard.achievements.items.collector.description",
    target: 5,
    metric: "bookmarksCount",
  },
];

/** How many entries the Reading History section shows before "Show more". */
export const HISTORY_PAGE_SIZE = 5;
