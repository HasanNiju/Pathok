import sanitizeHtml from "sanitize-html";
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
 * used for DOCX, whose plain-text extraction gives no font-size signal
 * to detect headings from more reliably (see chunkFormattedBlocksIntoChapters
 * for the PDF path, which does have that signal).
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

/** One paragraph/heading-level block recovered from the PDF, with both a
 *  plain-text form (search, TTS, bookmarks — anything that just needs the
 *  words) and a small sanitized-HTML form that keeps the bold/italic runs
 *  and heading status the source PDF actually had. */
export interface ExtractedBlock {
  text: string;
  html: string;
  isHeading: boolean;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = { allowedTags: ["b", "i", "br"], allowedAttributes: {} };

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

/** Merges adjacent runs that share the same bold/italic state, so the HTML
 *  isn't a separate <b>/<i> tag per word. */
function mergeRuns(runs: TextRun[]): TextRun[] {
  const merged: TextRun[] = [];
  for (const run of runs) {
    const last = merged[merged.length - 1];
    if (last && last.bold === run.bold && last.italic === run.italic) {
      last.text += run.text;
    } else {
      merged.push({ ...run });
    }
  }
  return merged;
}

function runsToHtml(runs: TextRun[]): string {
  return mergeRuns(runs)
    .map((run) => {
      let piece = escapeHtml(run.text);
      if (run.bold) piece = `<b>${piece}</b>`;
      if (run.italic) piece = `<i>${piece}</i>`;
      return piece;
    })
    .join("");
}

function runsToText(runs: TextRun[]): string {
  return runs
    .map((r) => r.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  fontName: string;
}

interface PdfLine {
  runs: TextRun[];
  y: number;
  fontSize: number;
}

/**
 * Extracts the PDF's actual text runs (position + font per glyph run) via
 * pdfjs-dist, then reconstructs paragraphs and headings from font size and
 * line spacing — preserving bold/italic and paragraph/heading structure,
 * unlike plain text extraction (extractTextFromPdf above) which throws all
 * of that away. Runs entirely server-side, no rendering/canvas involved.
 *
 * This is heuristic, not a perfect reproduction of the PDF's visual layout:
 * font size relative to the document's own body-text size drives heading
 * detection, and line-gap size drives paragraph breaks. It works well for
 * typical novel/document PDFs; unusual layouts (multi-column source PDFs,
 * heavily decorative typography) may not segment perfectly.
 */
export async function extractFormattedFromPdf(buffer: Buffer): Promise<ExtractedBlock[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // pdfjs ships its own substitute font data (for PDFs that reference a
  // standard font like Helvetica without embedding it) and CMap data (for
  // CID-keyed fonts using a predefined encoding) inside its own package —
  // point it there directly rather than relying on network fetches, which
  // don't apply in this server context anyway.
  const { createRequire } = await import("module");
  const { default: path } = await import("path");
  const require = createRequire(import.meta.url);
  const pdfjsDistDir = path.dirname(require.resolve("pdfjs-dist/package.json"));

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    // Node has no window/document/FontFace — useSystemFonts defaults to
    // false in pdfjs's own Node detection, and we keep it that way rather
    // than forcing the browser-oriented local-font-matching path. We only
    // need the font *descriptor* (bold/italic flags), not an actual
    // renderable substitute, so this doesn't cost us anything.
    useSystemFonts: false,
    disableFontFace: true,
    cMapUrl: path.join(pdfjsDistDir, "cmaps") + path.sep,
    cMapPacked: true,
    standardFontDataUrl: path.join(pdfjsDistDir, "standard_fonts") + path.sep,
  }).promise;

  const lines: PdfLine[] = [];
  const allFontSizes: number[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    try {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();

      const styleCache = new Map<string, { bold: boolean; italic: boolean }>();
      // pdfjs only populates page.commonObjs with font descriptors (needed
      // for bold/italic) once something has asked it to resolve the page's
      // resources — getTextContent() alone doesn't trigger that. This is a
      // heavier call than getTextContent (it walks the whole content
      // stream), so if it fails on some unusual/malformed page content, we
      // still keep that page's plain text rather than losing the page.
      let fontsResolved = true;
      try {
        await page.getOperatorList();
      } catch (err) {
        fontsResolved = false;
        console.warn(`[pdf-extract] page ${pageNum}: font resolution failed, continuing without bold/italic`, err);
      }

      const resolveStyle = (fontName: string) => {
        if (!fontsResolved) return { bold: false, italic: false };
        const cached = styleCache.get(fontName);
        if (cached) return cached;
        let style = { bold: false, italic: false };
        try {
          const fontObj = page.commonObjs.get(fontName) as
            | { name?: string; bold?: boolean; italic?: boolean }
            | undefined;
          if (fontObj) {
            const name = (fontObj.name ?? "").toLowerCase();
            style = {
              bold: Boolean(fontObj.bold) || /bold|black|heavy|semibold/.test(name),
              italic: Boolean(fontObj.italic) || /italic|oblique/.test(name),
            };
          }
        } catch {
          // Object not resolved for this specific font — degrade to plain text for it.
        }
        styleCache.set(fontName, style);
        return style;
      };

      // Bucket items into lines by baseline Y (rounded, so near-identical
      // baselines within the same line merge together).
      const buckets = new Map<number, PdfTextItem[]>();
      for (const raw of content.items) {
        if (!("str" in raw) || !raw.str) continue;
        const item = raw as unknown as PdfTextItem;
        const y = Math.round((item.transform[5] ?? 0) / 2) * 2;
        const bucket = buckets.get(y);
        if (bucket) bucket.push(item);
        else buckets.set(y, [item]);
      }

      const orderedLines = Array.from(buckets.entries()).sort((a, b) => b[0] - a[0]); // top → bottom (PDF y grows upward)

      for (const [y, items] of orderedLines) {
        const sorted = items.slice().sort((a, b) => (a.transform[4] ?? 0) - (b.transform[4] ?? 0)); // left → right
        const runs: TextRun[] = [];
        let maxFontSize = 0;
        let expectedX: number | null = null;

        for (const item of sorted) {
          const fontSize = Math.hypot(item.transform[0] ?? 0, item.transform[1] ?? 0) || 1;
          maxFontSize = Math.max(maxFontSize, fontSize);
          allFontSizes.push(fontSize);
          const style = resolveStyle(item.fontName);
          const x = item.transform[4] ?? 0;
          const gap = expectedX === null ? 0 : x - expectedX;
          const needsSpace = expectedX !== null && gap > fontSize * 0.15 && !/^\s/.test(item.str);
          runs.push({ text: (needsSpace ? " " : "") + item.str, bold: style.bold, italic: style.italic });
          expectedX = x + item.width;
        }

        if (runs.length > 0) lines.push({ runs: mergeRuns(runs), y, fontSize: maxFontSize });
      }
    } catch (err) {
      // One malformed page shouldn't sink the whole book — skip it and
      // keep going so the reader still gets every other page.
      console.warn(`[pdf-extract] page ${pageNum}: could not be read, skipping`, err);
    }
  }

  if (lines.length === 0) return [];

  const sortedSizes = allFontSizes.slice().sort((a, b) => a - b);
  const bodyFontSize = sortedSizes[Math.floor(sortedSizes.length / 2)] || 12;
  const isLargeText = (size: number) => size >= bodyFontSize * 1.18;

  const blocks: ExtractedBlock[] = [];
  let current: TextRun[] = [];
  let currentMaxFontSize = 0;
  let prevY: number | null = null;
  let prevFontSize: number | null = null;

  const flush = () => {
    if (current.length === 0) return;
    const text = runsToText(current);
    if (text) {
      blocks.push({ text, html: sanitizeHtml(runsToHtml(current), SANITIZE_OPTIONS), isHeading: isLargeText(currentMaxFontSize) && text.length <= 80 });
    }
    current = [];
    currentMaxFontSize = 0;
  };

  for (const line of lines) {
    const typicalLineGap = (prevFontSize ?? line.fontSize) * 1.6;
    const gap = prevY === null ? 0 : prevY - line.y;
    const startsNewParagraph =
      prevY === null ||
      gap > typicalLineGap ||
      isLargeText(line.fontSize) !== isLargeText(prevFontSize ?? line.fontSize);

    if (startsNewParagraph) {
      flush();
    } else if (current.length > 0) {
      // Wrapped continuation of the same paragraph — join with a space.
      const firstRun = line.runs[0];
      if (firstRun && !/^\s/.test(firstRun.text)) firstRun.text = ` ${firstRun.text}`;
    }

    current.push(...line.runs);
    currentMaxFontSize = Math.max(currentMaxFontSize, line.fontSize);
    prevY = line.y;
    prevFontSize = line.fontSize;
  }
  flush();

  return blocks;
}

/**
 * Groups extracted PDF blocks into chapters using the font-size-based
 * `isHeading` flag pdfjs gave us — far more reliable than the plain-text
 * regex guess chunkIntoChapters uses for DOCX, so a single confirmed
 * heading is enough to trust the structure.
 */
export function chunkFormattedBlocksIntoChapters(blocks: ExtractedBlock[], bookId: string): Chapter[] {
  if (blocks.length === 0) return [];

  const headingIndexes: number[] = [];
  blocks.forEach((b, i) => {
    if (b.isHeading) headingIndexes.push(i);
  });

  const useHeadings = headingIndexes.length >= 1 && headingIndexes.length < blocks.length / 2;
  const chapters: Chapter[] = [];

  const pushChapter = (title: string, body: ExtractedBlock[]) => {
    if (body.length === 0) return;
    chapters.push({
      id: `${bookId}-ch-${chapters.length + 1}`,
      bookId,
      order: chapters.length + 1,
      title,
      paragraphs: body.map((b) => b.text),
      paragraphsHtml: body.map((b) => b.html),
    });
  };

  if (useHeadings) {
    const firstHeading = headingIndexes[0] ?? 0;
    if (firstHeading > 0) pushChapter("Preface", blocks.slice(0, firstHeading));

    for (let i = 0; i < headingIndexes.length; i++) {
      const start = headingIndexes[i];
      if (start === undefined) continue;
      const end = i + 1 < headingIndexes.length ? headingIndexes[i + 1] : blocks.length;
      pushChapter(blocks[start]?.text ?? `Chapter ${chapters.length + 1}`, blocks.slice(start + 1, end));
    }
  } else {
    for (let i = 0; i < blocks.length; i += PARAGRAPHS_PER_FALLBACK_CHAPTER) {
      pushChapter(`Chapter ${chapters.length + 1}`, blocks.slice(i, i + PARAGRAPHS_PER_FALLBACK_CHAPTER));
    }
  }

  return chapters;
}
