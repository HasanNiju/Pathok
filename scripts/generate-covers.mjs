// One-off generator for local dummy cover art (no external images/APIs,
// per the PRD's "no fake APIs" / "no backend" rules). Run with:
//   node scripts/generate-covers.mjs
// Output lands in /public/covers and is committed like any other asset —
// this script does not need to run again unless src/data/books.json or
// src/data/categories.json changes.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const books = JSON.parse(readFileSync(path.join(root, "src/data/books.json"), "utf-8"));
const categories = JSON.parse(readFileSync(path.join(root, "src/data/categories.json"), "utf-8"));

const outDir = path.join(root, "public/covers");
mkdirSync(outDir, { recursive: true });

// Two-tone hue per category — chosen to feel distinct from the app's own
// blue accent, so covers read as "book" content rather than UI chrome.
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

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Greedy word-wrap for the SVG title block — returns an array of lines. */
function wrapText(text, maxCharsPerLine) {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildCover(book, category) {
  const [from, to] = PALETTE[book.categorySlug] ?? ["#334155", "#64748B"];
  const seed = hashString(book.id);
  const angle = 45 + (seed % 60) - 30; // 15–75 degrees, deterministic per book
  const titleLines = wrapText(book.title, 16).slice(0, 4);
  const lineHeight = 34;
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleStartY = 470 - titleBlockHeight;

  const eyebrow = escapeXml(category?.name?.toUpperCase() ?? "");
  const author = escapeXml(book.author);

  const titleTspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="40" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  return `<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(
    book.title
  )} cover">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
    <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.45" />
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#g)" />
  <circle cx="340" cy="90" r="120" fill="#ffffff" fill-opacity="0.07" />
  <circle cx="30" cy="540" r="90" fill="#000000" fill-opacity="0.08" />
  <rect width="400" height="600" fill="url(#fade)" />
  <text x="40" y="60" font-family="Georgia, 'Times New Roman', serif" font-size="12" letter-spacing="3" fill="#ffffff" fill-opacity="0.75">${eyebrow}</text>
  <rect x="40" y="76" width="32" height="2" fill="#ffffff" fill-opacity="0.6" />
  <text x="40" y="${titleStartY}" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="#ffffff">${titleTspans}</text>
  <text x="40" y="500" font-family="Georgia, 'Times New Roman', serif" font-size="14" fill="#ffffff" fill-opacity="0.85">${author}</text>
</svg>`;
}

for (const book of books) {
  const category = categories.find((c) => c.slug === book.categorySlug);
  const svg = buildCover(book, category);
  const filename = `${book.id}.svg`;
  writeFileSync(path.join(outDir, filename), svg, "utf-8");
}

console.log(`Generated ${books.length} covers in public/covers`);
