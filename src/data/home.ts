export interface HomeBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  readTime: string;
  progress?: number;
  featured?: boolean;
  coverUrl: string;
}

export interface HomeCategory {
  id: string;
  label: string;
  count: string;
}

function createCover(fill: string, accent: string, title: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
      <rect width="800" height="1200" rx="48" fill="${fill}" />
      <rect x="96" y="92" width="608" height="1016" rx="36" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.36)" stroke-width="4" />
      <rect x="132" y="132" width="536" height="936" rx="28" fill="${accent}" opacity="0.94" />
      <path d="M170 258C270 120 530 126 630 228" stroke="rgba(255,255,255,0.72)" stroke-width="18" fill="none" stroke-linecap="round" />
      <path d="M174 908C274 792 520 780 630 888" stroke="rgba(255,255,255,0.56)" stroke-width="14" fill="none" stroke-linecap="round" />
      <text x="400" y="720" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="700" fill="white">${title}</text>
      <text x="400" y="784" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="rgba(255,255,255,0.78)">Pathok</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const featuredBook: HomeBook = {
  id: "featured",
  title: "The Quiet Atlas",
  author: "Nadia Rahman",
  description:
    "A luminous novel about finding home in the spaces between memory and migration.",
  category: "Literary Fiction",
  readTime: "8 min read",
  progress: 74,
  featured: true,
  coverUrl: createCover("#09101f", "#2563eb", "The Quiet Atlas"),
};

export const continueReading: HomeBook[] = [
  {
    id: "continue-1",
    title: "The Last Orchard",
    author: "Mina Chowdhury",
    description: "A slow-blooming memoir on inheritance, grief, and the language of gardens.",
    category: "Memoir",
    readTime: "12 min read",
    progress: 61,
    coverUrl: createCover("#2b1d1d", "#f59e0b", "The Last Orchard"),
  },
  {
    id: "continue-2",
    title: "North of Summer",
    author: "Arif Hasan",
    description: "A travel diary that turns ordinary streets into unforgettable landscapes.",
    category: "Travel",
    readTime: "9 min read",
    progress: 43,
    coverUrl: createCover("#13253f", "#38bdf8", "North of Summer"),
  },
];

export const latestBooks: HomeBook[] = [
  {
    id: "latest-1",
    title: "Ink & Salt",
    author: "Rafia Noor",
    description: "A poetic collection of essays about cities, food, and belonging.",
    category: "Essays",
    readTime: "6 min read",
    coverUrl: createCover("#241a3a", "#a855f7", "Ink & Salt"),
  },
  {
    id: "latest-2",
    title: "Paper Lanterns",
    author: "Saad Ali",
    description: "A tender story about the people who keep small rituals alive.",
    category: "Contemporary",
    readTime: "7 min read",
    coverUrl: createCover("#1c2633", "#0f766e", "Paper Lanterns"),
  },
  {
    id: "latest-3",
    title: "A Room for Rain",
    author: "Tanzim Haque",
    description: "Atmospheric fiction where weather and memory are inseparable.",
    category: "Fiction",
    readTime: "5 min read",
    coverUrl: createCover("#2f1d2e", "#ec4899", "A Room for Rain"),
  },
  {
    id: "latest-4",
    title: "Minimal Days",
    author: "Jia Rahman",
    description: "A meditative exploration of routines, habits, and rewiring joy.",
    category: "Wellbeing",
    readTime: "4 min read",
    coverUrl: createCover("#132a20", "#22c55e", "Minimal Days"),
  },
];

export const trendingBooks: HomeBook[] = [
  {
    id: "trending-1",
    title: "The Blue Hour",
    author: "Nusrat Jahan",
    description: "An intimate portrait of longing, art, and the city after dusk.",
    category: "Drama",
    readTime: "11 min read",
    coverUrl: createCover("#15243b", "#2563eb", "The Blue Hour"),
  },
  {
    id: "trending-2",
    title: "Our Small Weather",
    author: "Ishrat Hossain",
    description: "A quietly powerful novel about community and difficult tenderness.",
    category: "Family",
    readTime: "10 min read",
    coverUrl: createCover("#1d2d2c", "#14b8a6", "Our Small Weather"),
  },
];

export const popularBooks: HomeBook[] = [
  {
    id: "popular-1",
    title: "When the Tide Turns",
    author: "Lamia Arif",
    description: "A deeply human story of ambition, home, and second chances.",
    category: "Fiction",
    readTime: "13 min read",
    coverUrl: createCover("#241f2d", "#8b5cf6", "When the Tide Turns"),
  },
  {
    id: "popular-2",
    title: "The Glass Stair",
    author: "Zeenat Khan",
    description: "A refined thriller about memory, obsession, and architecture.",
    category: "Thriller",
    readTime: "8 min read",
    coverUrl: createCover("#2d1f1f", "#ef4444", "The Glass Stair"),
  },
  {
    id: "popular-3",
    title: "Cedar & Smoke",
    author: "Arooj Faruqi",
    description: "A sensory journey of grief, ritual, and renewal through music.",
    category: "Poetry",
    readTime: "6 min read",
    coverUrl: createCover("#142737", "#f59e0b", "Cedar & Smoke"),
  },
];

export const recommendedBooks: HomeBook[] = [
  {
    id: "recommended-1",
    title: "Solstice Letters",
    author: "Farah Malik",
    description: "A beautifully paced epistolary novel about named and unnamed lives.",
    category: "Romance",
    readTime: "9 min read",
    coverUrl: createCover("#1b2230", "#6366f1", "Solstice Letters"),
  },
  {
    id: "recommended-2",
    title: "The Autumn Archive",
    author: "Talha Imran",
    description: "A luminous work of nonfiction rooted in family archives and memory.",
    category: "Nonfiction",
    readTime: "7 min read",
    coverUrl: createCover("#2c241e", "#fb923c", "The Autumn Archive"),
  },
  {
    id: "recommended-3",
    title: "Listening to Pines",
    author: "Mina Sayeed",
    description: "A contemplative companion for quiet evenings and slow mornings.",
    category: "Nature",
    readTime: "5 min read",
    coverUrl: createCover("#142822", "#84cc16", "Listening to Pines"),
  },
];

export const recentlyAdded: HomeBook[] = [
  {
    id: "recent-1",
    title: "An Unfinished Map",
    author: "Rumi Nayeem",
    description: "A richly observed story tracing the ways we reimagine belonging.",
    category: "Adventure",
    readTime: "5 min read",
    coverUrl: createCover("#24262f", "#475569", "An Unfinished Map"),
  },
  {
    id: "recent-2",
    title: "Half Light House",
    author: "Dina Rahman",
    description: "A haunting, elegant novel about the stories homes keep.",
    category: "Gothic",
    readTime: "7 min read",
    coverUrl: createCover("#2f1c2e", "#be185d", "Half Light House"),
  },
  {
    id: "recent-3",
    title: "Soft Signals",
    author: "Nadia Binte",
    description: "A collection of short, luminous essays on attention and care.",
    category: "Essay Collection",
    readTime: "4 min read",
    coverUrl: createCover("#142b3e", "#0ea5e9", "Soft Signals"),
  },
  {
    id: "recent-4",
    title: "The Bright Cactus",
    author: "Sajid Alam",
    description: "A warm and witty story about beginning again in a new city.",
    category: "Humor",
    readTime: "6 min read",
    coverUrl: createCover("#23332a", "#65a30d", "The Bright Cactus"),
  },
];

export const categories: HomeCategory[] = [
  { id: "fiction", label: "Fiction", count: "24 titles" },
  { id: "memoir", label: "Memoir", count: "12 titles" },
  { id: "design", label: "Design", count: "9 titles" },
  { id: "science", label: "Science", count: "15 titles" },
  { id: "poetry", label: "Poetry", count: "18 titles" },
  { id: "history", label: "History", count: "11 titles" },
];
