// One-off generator for local dummy banner art used behind the Book
// Details hero (no external images/APIs, per the PRD's "no fake APIs" /
// "no backend" rules). Run with:
//   node scripts/generate-banners.mjs
// Output lands in /public/banners and is committed like /public/covers —
// this script does not need to run again unless src/data/books.json or
// src/data/categories.json changes.
//
// Unlike covers, banners carry no baked-in text (title/author render as
// real, translatable DOM text on top of this image in the Book Details
// hero) — this file is purely an abstract, category-tinted backdrop.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const books = JSON.parse(readFileSync(path.join(root, "src/data/books.json"), "utf-8"));

const outDir = path.join(root, "public/banners");
mkdirSync(outDir, { recursive: true });

// Same two-tone hue per category as generate-covers.mjs, so a book's
// banner and cover always read as the same title.
const PALETTE = {
  fiction: ["#4338CA", "#6366F1"],
  "non-fiction": ["#0F766E", "#14B8A6"],
  "sci-fi": ["#1D4ED8", "#38BDF8"],
  fantasy: ["#6D28D9", "#A78BFA"],
  biography: ["#92400E", "#D97706"],
  business: ["#1E293B", "#475569"],
  "self-help": ["#BE123C", "#FB7185"],
  history: ["#78350F", "#B45309"],
  poetry: ["#86198F", "#D946EF"],
  mystery: ["#18181B", "#3F3F46"],
  romance: ["#9D174D", "#EC4899"],
  "bangla-classics": ["#065F46", "#10B981"],
};

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildBanner(book) {
  const [from, to] = PALETTE[book.categorySlug] ?? ["#334155", "#64748B"];
  const seed = hashString(book.id);
  const angle = 20 + (seed % 90); // deterministic per book, varies the gradient direction
  const orbX = 200 + (seed % 1200);
  const orbY = 60 + (seed % 120);

  return `<svg width="1600" height="520" viewBox="0 0 1600 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
    <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="55%" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55" />
    </linearGradient>
  </defs>
  <rect width="1600" height="520" fill="url(#g)" />
  <circle cx="${orbX}" cy="${orbY}" r="260" fill="#ffffff" fill-opacity="0.06" />
  <circle cx="${1600 - orbX * 0.6}" cy="460" r="220" fill="#000000" fill-opacity="0.08" />
  <rect width="1600" height="520" fill="url(#fade)" />
</svg>`;
}

for (const book of books) {
  const svg = buildBanner(book);
  writeFileSync(path.join(outDir, `${book.id}.svg`), svg, "utf-8");
}

console.log(`Generated ${books.length} banners in public/banners`);
