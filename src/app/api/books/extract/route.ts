import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import {
  chunkFormattedBlocksIntoChapters,
  chunkIntoChapters,
  extractFormattedFromPdf,
  extractTextFromDocx,
  extractTextFromPdf,
} from "@/lib/text-extraction";

export const runtime = "nodejs";

/**
 * Book Creation upload workflow, step 2: PDF/DOCX → extracted text → chapters.
 * Admin-only. Returns chapters for client-side preview; nothing is persisted
 * here — the admin still has to hit Publish/Save Draft, which calls
 * saveBookChapters via the Supabase client directly.
 *
 * PDFs go through extractFormattedFromPdf, which reads each glyph run's
 * position and font to preserve bold/italic and detect headings by actual
 * font size — not just a plain text dump. DOCX still uses plain-text
 * extraction + heading-guessing (chunkIntoChapters), since it has no
 * equivalent to check.
 */
export async function POST(request: Request) {
  const auth = await requireRole(["admin", "super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const formData = await request.formData();
  const file = formData.get("file");
  const bookId = formData.get("bookId");

  if (!(file instanceof File) || typeof bookId !== "string") {
    return NextResponse.json({ error: "Missing file or bookId." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx");

  if (!isPdf && !isDocx) {
    return NextResponse.json({ error: "Only PDF and DOCX files are supported." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isPdf) {
      let chapters;
      try {
        const blocks = await extractFormattedFromPdf(buffer);
        if (blocks.length === 0) throw new Error("Formatted extraction found no text blocks.");
        chapters = chunkFormattedBlocksIntoChapters(blocks, bookId);
      } catch (formattedError) {
        // The font-aware pipeline can fail on an unusual PDF (malformed
        // content stream, exotic font encoding, etc.) — fall back to a
        // plain-text extraction instead of blocking the upload entirely.
        // The book still gets chapters, just without preserved bold/italic.
        console.error("[extract] formatted PDF extraction failed, falling back to plain text:", formattedError);
        const text = await extractTextFromPdf(buffer);
        if (!text.trim()) {
          return NextResponse.json({ error: "No readable text could be found in this file." }, { status: 422 });
        }
        chapters = chunkIntoChapters(text, bookId);
      }
      return NextResponse.json({ chapters, fileType: "pdf" });
    }

    const text = await extractTextFromDocx(buffer);
    if (!text.trim()) {
      return NextResponse.json({ error: "No readable text could be found in this file." }, { status: 422 });
    }
    const chapters = chunkIntoChapters(text, bookId);
    return NextResponse.json({ chapters, fileType: "docx" });
  } catch (error) {
    console.error("[extract] file could not be processed:", error);
    return NextResponse.json({ error: "This file could not be processed." }, { status: 422 });
  }
}
