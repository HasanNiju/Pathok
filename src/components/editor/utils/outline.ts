import type { EditorPage, OutlineEntry, PMContent } from "@/components/editor/types/editor";

function textOf(node: PMContent): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(textOf).join("");
}

export function buildOutline(pages: EditorPage[]): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  for (const page of pages) {
    let pos = 0;
    const nodes = page.draftContent.content ?? [];
    for (const node of nodes) {
      if (node.type === "heading") {
        const level = (node.attrs?.level as 1 | 2 | 3) ?? 1;
        entries.push({ pageId: page.id, pageOrder: page.order, level, text: textOf(node), pos });
      }
      pos += 1;
    }
  }
  return entries;
}
