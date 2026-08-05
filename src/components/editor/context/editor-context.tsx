"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useEditorStore, type EditorStoreApi } from "@/components/editor/context/editor-store";
import type { EditorBook } from "@/components/editor/types/editor";

const EditorContext = createContext<EditorStoreApi | null>(null);

export function EditorProvider({ initialBook, children }: { initialBook: EditorBook | null; children: ReactNode }) {
  const store = useEditorStore(initialBook);
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>;
}

export function useEditorContext(): EditorStoreApi {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used inside <EditorProvider>");
  return ctx;
}
