import { useMemo } from "react";
import type { Editor } from "@tiptap/react";
import type { EditorPage, PMContent, EditorStats } from "@/components/editor/types/editor";

const WORDS_PER_MINUTE = 220;

function walk(node: PMContent, acc: { words: number; chars: number; paragraphs: number; images: number; headings: number }) {
  if (node.type === "paragraph") acc.paragraphs += 1;
  if (node.type === "heading") acc.headings += 1;
  if (node.type === "image") acc.images += 1;
  if (node.type === "text" && node.text) {
    acc.chars += node.text.length;
    acc.words += node.text.trim().length ? node.text.trim().split(/\s+/).length : 0;
  }
  node.content?.forEach((child) => walk(child, acc));
}

/** Aggregates stats across every page in the book, not just the active one. */
export function useBookStats(pages: EditorPage[]): EditorStats {
  return useMemo(() => {
    const acc = { words: 0, chars: 0, paragraphs: 0, images: 0, headings: 0 };
    pages.forEach((p) => walk(p.draftContent, acc));
    return {
      words: acc.words,
      characters: acc.chars,
      paragraphs: acc.paragraphs,
      images: acc.images,
      headings: acc.headings,
      readingMinutes: Math.max(1, Math.round(acc.words / WORDS_PER_MINUTE)),
    };
  }, [pages]);
}

/** Live stats for just the active Tiptap instance — cheaper, updates on every keystroke. */
export function useActivePageStats(editor: Editor | null) {
  return useMemo(() => {
    if (!editor) return { words: 0, characters: 0 };
    const text = editor.getText();
    const words = text.trim().length ? text.trim().split(/\s+/).length : 0;
    return { words, characters: editor.storage.characterCount?.characters() ?? text.length };
  }, [editor, editor?.state.doc]);
}
