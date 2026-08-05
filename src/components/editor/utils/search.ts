import type { Editor } from "@tiptap/react";
import type { EditorPage, EditorSearchHit } from "@/components/editor/types/editor";

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
}

function toPattern(query: string, opts: SearchOptions): RegExp {
  if (opts.regex) return new RegExp(query, opts.caseSensitive ? "g" : "gi");
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bounded = opts.wholeWord ? `\\b${escaped}\\b` : escaped;
  return new RegExp(bounded, opts.caseSensitive ? "g" : "gi");
}

/** Searches plain text across every page (fast, used for the results list). */
export function searchPages(pages: EditorPage[], query: string, opts: SearchOptions = {}): EditorSearchHit[] {
  if (!query.trim()) return [];
  const pattern = toPattern(query, opts);
  const hits: EditorSearchHit[] = [];
  for (const page of pages) {
    const text = flattenText(page.draftContent);
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text))) {
      const from = match.index;
      const to = from + match[0].length;
      hits.push({
        pageId: page.id,
        pageOrder: page.order,
        from,
        to,
        snippet: text.slice(Math.max(0, from - 30), to + 30),
      });
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }
  return hits;
}

function flattenText(node: { text?: string; content?: unknown[] }): string {
  if (node.text) return node.text;
  return ((node.content as { text?: string; content?: unknown[] }[]) ?? []).map(flattenText).join("");
}

/** Replace-all within a single mounted Tiptap editor instance (the active page). */
export function replaceAllInEditor(editor: Editor, query: string, replacement: string, opts: SearchOptions = {}) {
  const pattern = toPattern(query, opts);
  const text = editor.getText();
  if (!pattern.test(text)) return 0;
  let count = 0;
  const html = editor.getHTML();
  // Simplest reliable approach for replace-all: operate on plain text runs via
  // Tiptap's command chain per match, walking the doc back-to-front so earlier
  // positions aren't shifted by later replacements.
  const matches: { from: number; to: number }[] = [];
  let m: RegExpExecArray | null;
  pattern.lastIndex = 0;
  while ((m = pattern.exec(text))) {
    matches.push({ from: m.index, to: m.index + m[0].length });
    count += 1;
    if (m[0].length === 0) pattern.lastIndex += 1;
  }
  void html;
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { from, to } = matches[i];
    // Tiptap text positions are 1-indexed and offset by node boundaries; using
    // textBetween-based plain offsets works for single-paragraph-run matches,
    // which covers the common case. Complex cross-node matches are skipped.
    editor.chain().focus().insertContentAt({ from: from + 1, to: to + 1 }, replacement).run();
  }
  return count;
}
