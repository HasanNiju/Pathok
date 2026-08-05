"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { buildExtensions } from "@/components/editor/extensions";
import type { EditorPage, PMContent } from "@/components/editor/types/editor";
import type { Editor } from "@tiptap/react";

interface EditorPageCanvasProps {
  page: EditorPage;
  zoom: number;
  onContentChange: (content: PMContent) => void;
  onEditorReady: (editor: Editor | null) => void;
}

/**
 * One page = one Tiptap instance. Only the active page is mounted (Module 21:
 * lazy rendering) — switching pages unmounts the previous editor and mounts
 * a fresh one seeded with that page's draft content.
 */
export function EditorPageCanvas({ page, zoom, onContentChange, onEditorReady }: EditorPageCanvasProps) {
  const editor = useEditor({
    extensions: buildExtensions("Start writing this page…"),
    content: page.draftContent,
    editorProps: {
      attributes: {
        class: "editor-prose focus:outline-none",
        "aria-label": `Page ${page.order} content`,
      },
    },
    onUpdate: ({ editor: e }) => onContentChange(e.getJSON() as PMContent),
    immediatelyRender: false,
  });

  useEffect(() => {
    onEditorReady(editor ?? null);
    return () => onEditorReady(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    return () => {
      editor.destroy();
    };
  }, [editor]);

  return (
    <div className="flex justify-center py-10">
      <div
        className="w-full max-w-[816px] rounded-lg border border-border bg-card px-16 py-14 shadow-sm transition-transform"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
