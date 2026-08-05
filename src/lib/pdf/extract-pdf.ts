import type { EditorPage, PMContent } from "@/components/editor/types/editor";

export interface PdfExtractProgress {
  page: number;
  totalPages: number;
}

interface PdfTextItem {
  str: string;
  height: number;
  transform: number[];
  hasEOL?: boolean;
}

/**
 * Extracts every page of a PDF into editor pages, preserving paragraph
 * breaks and guessing headings from relative font size. Runs entirely in
 * the browser via pdfjs-dist — no server round trip.
 */
export async function extractPdfToPages(
  file: File,
  bookId: string,
  onProgress?: (p: PdfExtractProgress) => void
): Promise<EditorPage[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: EditorPage[] = [];
  const now = new Date().toISOString();

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as PdfTextItem[];
    const content = itemsToDoc(items);
    pages.push({
      id: `pg_${bookId}_${i}_${Date.now().toString(36)}`,
      bookId,
      order: i,
      title: firstHeadingOrFallback(content, i),
      draftContent: content,
      publishedContent: null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    onProgress?.({ page: i, totalPages: pdf.numPages });
  }
  return pages;
}

/** Groups text items into paragraphs by line breaks, flags large-font lines as headings. */
function itemsToDoc(items: PdfTextItem[]): PMContent {
  if (items.length === 0) return { type: "doc", content: [{ type: "paragraph" }] };

  const heights = items.map((it) => it.height).filter((h) => h > 0);
  const bodySize = median(heights) || 12;

  const lines: { text: string; height: number }[] = [];
  let current = "";
  let currentHeight = 0;
  for (const item of items) {
    current += item.str;
    currentHeight = Math.max(currentHeight, item.height);
    if (item.hasEOL || item.str.trim() === "") {
      if (current.trim()) lines.push({ text: current.trim(), height: currentHeight });
      current = "";
      currentHeight = 0;
    }
  }
  if (current.trim()) lines.push({ text: current.trim(), height: currentHeight });

  const blocks: PMContent[] = lines.map((line) => {
    const ratio = line.height / bodySize;
    if (ratio >= 1.6) return headingNode(line.text, 1);
    if (ratio >= 1.3) return headingNode(line.text, 2);
    return { type: "paragraph", content: [{ type: "text", text: line.text }] };
  });

  return { type: "doc", content: blocks.length ? blocks : [{ type: "paragraph" }] };
}

function headingNode(text: string, level: 1 | 2): PMContent {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function firstHeadingOrFallback(doc: PMContent, pageNum: number): string {
  const heading = doc.content?.find((n) => n.type === "heading");
  const text = heading?.content?.[0]?.text;
  return text || `Page ${pageNum}`;
}
