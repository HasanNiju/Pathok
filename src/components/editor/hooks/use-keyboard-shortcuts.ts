"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onSave: () => void;
  onPublish: () => void;
  onFind: () => void;
  onPreviewToggle: () => void;
}

/**
 * App-level shortcuts that aren't already Tiptap keymaps (Bold/Italic/Underline
 * /Undo/Redo/Tab/Shift-Tab are handled by StarterKit + the browser inside the
 * editor itself). This covers the ones that need to work regardless of focus.
 */
export function useKeyboardShortcuts({ onSave, onPublish, onFind, onPreviewToggle }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        onSave();
      } else if (e.key.toLowerCase() === "s" && e.shiftKey) {
        e.preventDefault();
        onPublish();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        onFind();
      } else if (e.key === "/") {
        e.preventDefault();
        onPreviewToggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onPublish, onFind, onPreviewToggle]);
}
