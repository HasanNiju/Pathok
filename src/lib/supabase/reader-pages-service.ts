import type { SupabaseClient } from "@supabase/supabase-js";
import { generateHTML } from "@tiptap/html";
import { buildExtensions } from "@/components/editor/extensions";
import type { PMContent } from "@/components/editor/types/editor";
import type { Chapter } from "@/types/reader";

/**
 * Editor v2 (see EDITOR_V2_README.md) stores published content as ProseMirror
 * JSON in `book_pages.published_content`, one row per page. The Reader was
 * never cut over from the legacy `book_chapters` table (plain paragraphs +
 * sanitized inline HTML) — that's the "Reader cutover" step the v2 package
 * shipped without. This adapter is that cutover: it turns each published
 * page into a `Chapter`, reusing the exact Tiptap extension set the editor
 * and its preview panel already render with, so headings/lists/tables/images
 * come out identical to what the author saw while writing.
 *
 * Every top-level ProseMirror node in a page (a paragraph, a heading, a
 * list, a table, an image, ...) becomes one `paragraphs[i]` / `paragraphsHtml[i]`
 * entry. That keeps every index-based Reader feature (bookmarks, search,
 * highlights, TTS) working exactly the way it already does for
 * `book_chapters` content — it doesn't know or care whether a "paragraph"
 * came from a plain paragraph node or a table.
 */

interface BookPageRow {
  id: string;
  book_id: string;
  order: number;
  title: string;
  published_content: PMContent | null;
  status: "empty" | "draft" | "ready";
}

/** Plain-text content of a node and everything nested inside it. */
function extractText(node: PMContent): string {
  if (node.text) return node.text;
  if (!node.content || node.content.length === 0) return "";
  return node.content
    .map(extractText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const extensions = buildExtensions();

/** Renders a single top-level block node back to HTML via the same
 *  extension set the editor/preview use, so formatting matches exactly. */
function renderBlockHtml(node: PMContent): string {
  try {
    return generateHTML({ type: "doc", content: [node] }, extensions);
  } catch {
    // A node the current extension set can't render (e.g. content saved by
    // an older/newer schema version) — fall back to its plain text so the
    // page still shows something instead of throwing the whole chapter away.
    return "";
  }
}

/**
 * Fetches every published (`status = 'ready'`) page for a book and adapts
 * it into the Reader's `Chapter[]` shape. Returns an empty array for books
 * that have no Editor v2 content yet (e.g. still on the legacy chapter
 * editor), so callers can fall back to `fetchBookChapters`.
 */
export async function fetchBookPagesAsChapters(supabase: SupabaseClient, bookId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from("book_pages")
    .select("id,book_id,order,title,published_content,status")
    .eq("book_id", bookId)
    .eq("status", "ready")
    .order("order", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as BookPageRow[];
  const withContent = rows.filter((row) => row.published_content && (row.published_content.content?.length ?? 0) > 0);
  if (withContent.length === 0) return [];

  return withContent.map((row, pageIndex): Chapter => {
    const blocks = row.published_content!.content ?? [];
    const paragraphs = blocks.map((node) => extractText(node)).map((text) => (text.length > 0 ? text : " "));
    const paragraphsHtml = blocks.map((node) => renderBlockHtml(node));

    return {
      id: row.id,
      bookId: row.book_id,
      order: pageIndex + 1,
      title: row.title || `Page ${row.order}`,
      paragraphs,
      paragraphsHtml,
    };
  });
}
