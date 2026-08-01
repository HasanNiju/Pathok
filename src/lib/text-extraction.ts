import type { Chapter } from "@/types/reader";

/** Lines that look like a chapter heading: short, no trailing period, own line. */
function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 70) return false;
  if (/[.,;:]$/.test(trimmed)) return false;
  return /^(chapter|part|book|prologue|epilogue|অধ্যায়|পর্ব)\b/i.test(trimmed) || /^[A-Z0-9 .'’\-]{3,70}$/.test(trimmed);
}

const PARAGRAPHS_PER_FALLBACK_CHAPTER = 25;

/**
 * Splits raw extracted text into chapters. Prefers detected headings
 * ("Chapter 1", "Prologue", ALL-CAPS section titles); falls back to
 * fixed-size grouping when the source has no recognizable structure —
 * common for scanned/():-converted PDFs with no consistent heading style.
 */
export function chunkIntoChapters(rawText: string, bookId: string): Chapter[] {
  const paragraphs = rawText
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  const headingIndexes: number[] = [];
  paragraphs.forEach((p, i) => {
    if (looksLikeHeading(p)) headingIndexes.push(i);
  });

  const useHeadings = headingIndexes.length >= 2 && headingIndexes.length < paragraphs.length / 3;

  const chapters: Chapter[] = [];

  if (useHeadings) {
    for (let i = 0; i < headingIndexes.length; i++) {
      const start = headingIndexes[i];
      if (start === undefined) continue;
      const end = i + 1 < headingIndexes.length ? headingIndexes[i + 1] : paragraphs.length;
      const title = paragraphs[start] ?? `Chapter ${chapters.length + 1}`;
      const body = paragraphs.slice(start + 1, end);
      if (body.length === 0) continue;
      chapters.push({ id: `${bookId}-ch-${chapters.length + 1}`, bookId, order: chapters.length + 1, title, paragraphs: body });
    }
  } else {
    for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_FALLBACK_CHAPTER) {
      const body = paragraphs.slice(i, i + PARAGRAPHS_PER_FALLBACK_CHAPTER);
      chapters.push({
        id: `${bookId}-ch-${chapters.length + 1}`,
        bookId,
        order: chapters.length + 1,
        title: `Chapter ${chapters.length + 1}`,
        paragraphs: body,
      });
    }
  }

  return chapters;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text;
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
