export interface BookDetailData {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  longDescription: string;
  rating: number;
  reviews: number;
  readTime: string;
  published: string;
  language: string;
  coverUrl: string;
  bannerColor: string;
  accentColor: string;
  tags: string[];
  comments: Array<{
    id: string;
    user: string;
    role: string;
    text: string;
    time: string;
  }>;
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

export const books: BookDetailData[] = [
  {
    id: "the-quiet-atlas",
    title: "The Quiet Atlas",
    author: "Nadia Rahman",
    genre: "Literary Fiction",
    description: "A luminous novel about finding home in the spaces between memory and migration.",
    longDescription:
      "In this intimate, beautifully paced novel, a young archivist returns to the city of her childhood to reconstruct the life of her grandmother. What begins as a simple act of preservation becomes a meditation on memory, inheritance, and the quiet maps we build in our own lives.",
    rating: 4.8,
    reviews: 124,
    readTime: "8 min read",
    published: "2024",
    language: "English",
    coverUrl: createCover("#09101f", "#2563eb", "The Quiet Atlas"),
    bannerColor: "from-primary/20 via-card to-secondary",
    accentColor: "#2563eb",
    tags: ["Migration", "Family", "Memory"],
    comments: [
      {
        id: "c1",
        user: "Ayesha",
        role: "Reader",
        text: "The prose feels so calm and deliberate. It made me slow down and read every line.",
        time: "2 hours ago",
      },
      {
        id: "c2",
        user: "Ibrahim",
        role: "Book club",
        text: "A beautiful choice for a reflective evening. The emotional arc is subtle but powerful.",
        time: "1 day ago",
      },
    ],
  },
  {
    id: "the-last-orchard",
    title: "The Last Orchard",
    author: "Mina Chowdhury",
    genre: "Memoir",
    description: "A slow-blooming memoir on inheritance, grief, and the language of gardens.",
    longDescription:
      "The Last Orchard traces a family’s changing relationship to land, memory, and loss through the life of a single garden. It is tender, reflective, and full of the kind of detail that turns a memoir into a lived-in place.",
    rating: 4.6,
    reviews: 89,
    readTime: "12 min read",
    published: "2023",
    language: "English",
    coverUrl: createCover("#2b1d1d", "#f59e0b", "The Last Orchard"),
    bannerColor: "from-amber-500/15 via-card to-secondary",
    accentColor: "#f59e0b",
    tags: ["Memoir", "Grief", "Nature"],
    comments: [
      {
        id: "c3",
        user: "Sadia",
        role: "Reader",
        text: "This felt like a place I could almost step into. Very grounding.",
        time: "4 hours ago",
      },
    ],
  },
  {
    id: "north-of-summer",
    title: "North of Summer",
    author: "Arif Hasan",
    genre: "Travel",
    description: "A travel diary that turns ordinary streets into unforgettable landscapes.",
    longDescription:
      "A vivid and observant travel narrative that moves from busy station platforms to quiet coastlines. Each chapter invites readers to notice the texture of ordinary places and the stories they quietly hold.",
    rating: 4.7,
    reviews: 67,
    readTime: "9 min read",
    published: "2022",
    language: "English",
    coverUrl: createCover("#13253f", "#38bdf8", "North of Summer"),
    bannerColor: "from-sky-500/15 via-card to-secondary",
    accentColor: "#38bdf8",
    tags: ["Travel", "Atmosphere", "Essay"],
    comments: [
      {
        id: "c4",
        user: "Tasmia",
        role: "Traveler",
        text: "The writing is sensory and understated. I want to read it slowly and linger in it.",
        time: "6 hours ago",
      },
    ],
  },
];

export function getBookById(bookId: string) {
  return books.find((book) => book.id === bookId);
}

export function getRelatedBooks(bookId: string) {
  return books.filter((book) => book.id !== bookId).slice(0, 4);
}
