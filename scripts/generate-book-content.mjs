// One-off generator for local dummy book text (no external APIs, per the
// PRD's "no fake APIs" / "no backend" rules — the real pipeline is
// PDF/DOCX -> extract text -> store; this script stands in for that
// extraction step with committed placeholder prose). Run with:
//   node scripts/generate-book-content.mjs
// Output lands in src/data/book-content.json and is committed like any
// other dummy dataset — this only needs to run again if books.json gains
// or removes titles.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const books = JSON.parse(readFileSync(path.join(root, "src/data/books.json"), "utf-8"));
const metadata = JSON.parse(readFileSync(path.join(root, "src/data/book-metadata.json"), "utf-8"));

/** Deterministic PRNG seeded from a string, so re-running this script
 *  produces byte-identical output (important for diffs/reviews). */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle(rng, arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Sentence banks, one per catalog category, written to be reorderable —
// each sentence stands alone so paragraphs built by sampling them still
// read coherently enough for a reading-experience demo.
const BANKS = {
  fiction: [
    "The house still smelled of woodsmoke long after the fire had gone out.",
    "She counted the cracks in the ceiling the way other people counted sheep.",
    "Nobody in the family talked about the year the orchard failed.",
    "He kept the letter folded in quarters, soft now at every seam.",
    "The kitchen table had outlived three arguments and one wedding.",
    "There was a particular silence that only siblings could share.",
    "The train was late, which felt, that morning, like a mercy.",
    "Some inheritances were land, and some were simply unfinished business.",
    "She recognized her mother's handwriting before she recognized the words.",
    "The porch light stayed on for a guest who was, by then, three years overdue.",
  ],
  "non-fiction": [
    "The archive held more silence than record.",
    "History rarely arrives all at once; it leaks in through footnotes.",
    "The interview ran forty minutes past its scheduled end.",
    "What the records omitted said as much as what they kept.",
    "Every statistic in the chapter had a name attached to it, somewhere.",
    "The author had spent eleven years chasing a single sentence in a ledger.",
    "It was easier to explain the policy than to explain its cost.",
    "The photograph had been mislabeled for four decades before anyone noticed.",
    "Consensus, it turned out, had been manufactured, not discovered.",
    "The footnotes were where the real argument was happening.",
  ],
  "sci-fi": [
    "The signal repeated every eleven hours, precise as a heartbeat.",
    "No one on the station had slept properly since the readings changed.",
    "The ship's hull ticked as it cooled, counting down to nothing in particular.",
    "Gravity on the outer ring was always a half-second behind the rest of the station.",
    "The colony had stopped sending status reports six cycles ago.",
    "Somewhere below the ice, the drill had found something that wasn't rock.",
    "The AI's voice was calm in the way that made the crew more nervous, not less.",
    "Light from the dead star still hadn't finished arriving.",
    "The last transmission ended mid-sentence, as if interrupted rather than cut.",
    "Every simulation predicted the same outcome, and every simulation was wrong.",
  ],
  fantasy: [
    "The old maps marked the forest as unclaimed, which was its own kind of warning.",
    "No blacksmith in three kingdoms could explain why the blade never dulled.",
    "The river had a name older than the language spoken beside it.",
    "Court whispered that the throne remembered every hand that had touched it.",
    "The spell worked, which frightened her more than if it had failed.",
    "Dragons, the old stories agreed, always kept better records than kings.",
    "The vines around the ruined tower grew thicker every solstice.",
    "A promise made at the crossroads shrine was said to bind on both sides.",
    "The last of the old order carried its oath the way others carried scars.",
    "Magic, out here, was less a gift than a debt collected slowly.",
  ],
  biography: [
    "By the time the letters were published, half the people in them had died.",
    "Success, for him, had always arrived a year later than he needed it to.",
    "She kept two versions of every story: the one for interviews, and the true one.",
    "The early failures were the chapters he asked the editor to cut, and lost that argument.",
    "Nobody who knew her at twenty would have predicted the twenty years that followed.",
    "The diary entries grew shorter exactly when the fame grew larger.",
    "He credited luck in public and discipline in private, and meant both.",
    "The family rarely appears in the official record, though they appear in every margin.",
    "What the biographies leave out is usually the part that explains the rest.",
    "She never once, in forty years of interviews, mentioned the year she almost quit.",
  ],
  business: [
    "The pitch deck had eleven versions before anyone agreed to fund it.",
    "Growth, that quarter, hid a runway that was shorter than anyone admitted.",
    "The founders had disagreed about almost everything except the deadline.",
    "Every investor asked the same question, and every answer was a little different.",
    "The spreadsheet said the company had four months; the founders believed six.",
    "Culture, it turned out, was the first thing the acquisition changed.",
    "The best decision of the year was the meeting they refused to have.",
    "Nobody wrote the failure into the case study, but everyone in the room remembered it.",
    "The product worked. The distribution never did, not until it was almost too late.",
    "Trust, once spent between co-founders, was the hardest line item to rebuild.",
  ],
  "self-help": [
    "The habit was smaller than anyone expected it to matter, which was the point.",
    "Discipline, most days, looked exactly like doing the unremarkable thing again.",
    "She stopped waiting to feel ready, and started instead.",
    "The morning routine wasn't magic; it was just consistent.",
    "Rest, it turned out, was a decision, not a reward.",
    "The goal mattered less than the system built quietly underneath it.",
    "He measured progress in weeks, never in single mornings.",
    "Comparison was the fastest way to lose an otherwise good day.",
    "The hardest habit to keep was the one nobody was watching him do.",
    "Change rarely announced itself; it simply accumulated.",
  ],
  history: [
    "The treaty was signed in a room too small for the number of people it affected.",
    "Nobody present at the border redrawing thought it would last a century.",
    "The famine reached the capital's newspapers eleven weeks after it reached the villages.",
    "Partition split more than land; it split the ledgers, the songs, and the surnames.",
    "The general's own letters contradict the version taught in most classrooms.",
    "What the empire called order, the province had a different word for.",
    "The census that year undercounted almost everyone it was meant to protect.",
    "Independence, when it came, arrived on a Tuesday nobody had prepared for.",
    "The monument was built to a version of the story that survived the editing.",
    "Every old railway line in the region still followed the shape of an old occupation.",
  ],
  poetry: [
    "The evening arrives the way an old debt does, quietly and on time.",
    "Rain on the tin roof keeps a rhythm no clock could improve on.",
    "Between one lamp and the next, the whole street learns to be patient.",
    "Grief, like tea, is better after it has had time to cool.",
    "The river takes the shape of whoever last stood at its edge.",
    "Morning does not ask permission before it changes the color of the wall.",
    "A held breath and a held silence are, in the end, the same instrument.",
    "The last bus of the night carries more longing than passengers.",
    "Even the monsoon keeps a diary, written in the color of the paddy.",
    "Distance is just another word for a letter not yet written.",
  ],
  mystery: [
    "The map had been redrawn, and no one would say who had ordered it.",
    "Her office was exactly as she left it, which was the first wrong detail.",
    "The witness remembered everything except the one hour that mattered.",
    "Two ledgers told two different stories, and only one of them was meant to be found.",
    "The interrogation room's clock had been three minutes fast for as long as anyone could recall.",
    "Nobody reported her missing until the mail had piled up for a week.",
    "The alibi held up everywhere except the one place it needed to.",
    "Every question he asked got the same answer, delivered with a little too much care.",
    "The case file was thinner than it should have been for a death this public.",
    "Someone had been in the archive after hours, and had been careful about it.",
  ],
  romance: [
    "They had agreed, years ago, to stop keeping count of the almosts.",
    "The letter arrived a decade later than it was written, and somehow on time anyway.",
    "She recognized his handwriting on the envelope before she recognized her own address.",
    "Some conversations only happen once, and they had already used theirs.",
    "The two of them had never once agreed on the ending, only on the beginning.",
    "He kept the ticket stub from the night that changed absolutely nothing, on purpose.",
    "Distance had made them careful, and carefulness had made them polite instead of honest.",
    "The city was smaller with her in it, in the good way distances can be small.",
    "Neither of them said the word first, which was its own kind of agreement.",
    "The last train home always left five minutes before either of them was ready.",
  ],
  "bangla-classics": [
    "গ্রামের পথে সন্ধ্যার আলো নরম হয়ে নেমে আসত।",
    "নদীর ধারে বসে সে বহুদিনের পুরনো কথাগুলো মনে করত।",
    "চিঠিটা বহুবার পড়া হয়েছিল, তবু প্রতিবারই নতুন লাগত।",
    "উঠোনের কোণে দাঁড়িয়ে থাকা গাছটা যেন সব গল্প মনে রাখত।",
    "শহরের কোলাহল থেকে দূরে এই বাড়িটা এখনও চুপচাপ দাঁড়িয়ে ছিল।",
    "মায়ের হাতের লেখা দেখলেই সে বুঝত চিঠিটা কার কাছ থেকে এসেছে।",
    "বর্ষার প্রথম বৃষ্টি সবসময় পুরনো স্মৃতি নিয়ে আসত।",
    "সময় বদলেছে, কিন্তু ঘরের সেই পুরনো ঘড়িটা এখনও থেমে আছে সেই বিকেলেই।",
    "দাদুর গল্পগুলো প্রতিবার একটু একটু বদলে যেত, তবু শেষটা একই থাকত।",
    "স্টেশনের প্ল্যাটফর্মে দাঁড়িয়ে সে শেষবারের মতো ফিরে তাকাল।",
  ],
};

const DEFAULT_BANK = BANKS.fiction;

// Chapter title templates, sampled per book (kept generic on purpose —
// these are placeholder chapters, not a real table of contents).
const CHAPTER_TITLE_TEMPLATES = [
  "The Arrival",
  "What the Records Show",
  "A Door Left Open",
  "Before the Crossing",
  "The First Warning",
  "An Old Debt",
  "The Long Way Back",
  "What Remained",
  "The Quiet Hour",
  "A Different Ledger",
  "The Turning",
  "Nothing Left Unsaid",
  "The Weight of It",
  "A Small Reckoning",
  "The Last Ordinary Day",
];

const bnChapterTitles = [
  "আগমন",
  "পুরনো চিঠি",
  "একটি খোলা দরজা",
  "প্রথম সতর্কতা",
  "ফেলে আসা ঋণ",
  "দীর্ঘ পথ",
  "যা রয়ে গেল",
  "নীরব প্রহর",
  "নতুন হিসাব",
  "শেষ সাধারণ দিন",
];

function buildParagraph(rng, bank, minSentences = 3, maxSentences = 6) {
  const count = minSentences + Math.floor(rng() * (maxSentences - minSentences + 1));
  const sentences = shuffle(rng, bank).slice(0, count);
  return sentences.join(" ");
}

function buildChapter(rng, bank, order, isBn, book) {
  const paragraphCount = 6 + Math.floor(rng() * 5); // 6..10
  const paragraphs = Array.from({ length: paragraphCount }, () => buildParagraph(rng, bank));

  const titlePool = isBn ? bnChapterTitles : CHAPTER_TITLE_TEMPLATES;
  const title = `${order}. ${pick(rng, titlePool)}`;

  return {
    id: `${book.id}-ch${String(order).padStart(2, "0")}`,
    bookId: book.id,
    order,
    title,
    paragraphs,
  };
}

const content = books.map((book) => {
  const meta = metadata.find((m) => m.bookId === book.id);
  const isBn = meta?.language === "bn";
  const bank = BANKS[book.categorySlug] ?? (isBn ? BANKS["bangla-classics"] : DEFAULT_BANK);
  const rng = mulberry32(seedFromString(book.id));

  // Longer books (by readingMinutes) get more chapters, within a sane range.
  const chapterCount = Math.max(6, Math.min(14, Math.round(book.readingMinutes / 35)));
  const chapters = Array.from({ length: chapterCount }, (_, i) =>
    buildChapter(rng, bank, i + 1, isBn, book)
  );

  return { bookId: book.id, chapters };
});

writeFileSync(
  path.join(root, "src/data/book-content.json"),
  JSON.stringify(content, null, 2) + "\n"
);

console.log(`Generated content for ${content.length} books.`);
