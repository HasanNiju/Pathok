import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/route-guard";
import { chunkIntoChapters, extractTextFromDocx, extractTextFromPdf } from "@/lib/text-extraction";

export const runtime = "nodejs";

/**
 * Book Creation upload workflow, step 2: PDF/DOCX → extracted text → chapters.
 * Admin-only. Returns chapters for client-side preview; nothing is persisted
 * here — the admin still has to hit Publish/Save Draft, which calls
 * saveBookChapters via the Supabase client directly.
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
    const text = isPdf ? await extractTextFromPdf(buffer) : await extractTextFromDocx(buffer);

    if (!text.trim()) {
      return NextResponse.json({ error: "No readable text could be found in this file." }, { status: 422 });
    }

    const chapters = chunkIntoChapters(text, bookId);
    return NextResponse.json({ chapters, fileType: isPdf ? "pdf" : "docx" });
  } catch {
    return NextResponse.json({ error: "This file could not be processed." }, { status: 422 });
  }
}
