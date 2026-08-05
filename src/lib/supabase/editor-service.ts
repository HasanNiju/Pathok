import { createClient } from "@/lib/supabase/client";
import type { EditorBook, EditorPage, PMContent } from "@/components/editor/types/editor";
import { EMPTY_DOC } from "@/components/editor/types/editor";

interface PageRow {
  id: string;
  book_id: string;
  order: number;
  title: string;
  draft_content: PMContent;
  published_content: PMContent | null;
  status: "empty" | "draft" | "ready";
  created_at: string;
  updated_at: string;
}

function pageFromRow(row: PageRow): EditorPage {
  return {
    id: row.id,
    bookId: row.book_id,
    order: row.order,
    title: row.title,
    draftContent: row.draft_content ?? EMPTY_DOC,
    publishedContent: row.published_content,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Loads a book's editor state. Returns an empty single-page book if none exists yet. */
export async function loadEditorBook(bookId: string): Promise<EditorBook> {
  const supabase = createClient();

  const [{ data: pageRows, error: pagesError }, { data: metaRow }] = await Promise.all([
    supabase.from("book_pages").select("*").eq("book_id", bookId).order("order", { ascending: true }),
    supabase.from("book_editor_meta").select("*").eq("book_id", bookId).maybeSingle(),
  ]);

  if (pagesError) throw pagesError;

  const pages =
    pageRows && pageRows.length > 0
      ? (pageRows as PageRow[]).map(pageFromRow)
      : [
          {
            id: `pg_${bookId}_1`,
            bookId,
            order: 1,
            title: "Page 1",
            draftContent: EMPTY_DOC,
            publishedContent: null,
            status: "empty" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

  return {
    bookId,
    status: metaRow?.status ?? "draft",
    meta: {
      subtitle: metaRow?.subtitle ?? undefined,
      edition: metaRow?.edition ?? undefined,
      language: metaRow?.language ?? "bn",
    },
    pages,
    lastSavedAt: metaRow?.last_saved_at ?? null,
  };
}

/** Upserts every page's draft content. Called by the autosave hook. */
export async function saveDraft(book: EditorBook): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const rows = book.pages.map((p) => ({
    id: p.id,
    book_id: book.bookId,
    order: p.order,
    title: p.title,
    draft_content: p.draftContent,
    published_content: p.publishedContent,
    status: p.status,
    updated_at: now,
  }));

  const { error: pagesErr } = await supabase.from("book_pages").upsert(rows, { onConflict: "id" });
  if (pagesErr) throw pagesErr;

  const { error: metaErr } = await supabase
    .from("book_editor_meta")
    .upsert(
      { book_id: book.bookId, status: book.status, subtitle: book.meta.subtitle, edition: book.meta.edition, language: book.meta.language, last_saved_at: now },
      { onConflict: "book_id" }
    );
  if (metaErr) throw metaErr;
}

/** Replaces `published_content` with the current draft for every page, flips book status. */
export async function publishBook(book: EditorBook): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const rows = book.pages.map((p) => ({
    id: p.id,
    book_id: book.bookId,
    order: p.order,
    title: p.title,
    draft_content: p.draftContent,
    published_content: p.draftContent,
    status: "ready" as const,
    updated_at: now,
  }));

  const { error: pagesErr } = await supabase.from("book_pages").upsert(rows, { onConflict: "id" });
  if (pagesErr) throw pagesErr;

  const { error: metaErr } = await supabase
    .from("book_editor_meta")
    .upsert({ book_id: book.bookId, status: "published", last_saved_at: now }, { onConflict: "book_id" });
  if (metaErr) throw metaErr;

  const { error: bookErr } = await supabase.from("books").update({ status: "published", content_ready: true }).eq("id", book.bookId);
  if (bookErr) throw bookErr;
}

/** Bulk-inserts freshly PDF-extracted pages, replacing whatever pages exist. */
export async function replaceAllPages(bookId: string, pages: EditorPage[]): Promise<void> {
  const supabase = createClient();
  const { error: delErr } = await supabase.from("book_pages").delete().eq("book_id", bookId);
  if (delErr) throw delErr;

  const rows = pages.map((p) => ({
    id: p.id,
    book_id: bookId,
    order: p.order,
    title: p.title,
    draft_content: p.draftContent,
    published_content: null,
    status: p.status,
  }));
  const { error: insErr } = await supabase.from("book_pages").insert(rows);
  if (insErr) throw insErr;
}

export async function uploadEditorImage(bookId: string, file: File): Promise<string> {
  const supabase = createClient();
  const path = `${bookId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await supabase.storage.from("book-editor-images").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("book-editor-images").getPublicUrl(path);
  return data.publicUrl;
}
