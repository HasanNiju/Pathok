"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorBook } from "@/components/editor/types/editor";
import { saveDraft } from "@/lib/supabase/editor-service";

export type AutosaveState = "idle" | "saving" | "saved" | "error";

/**
 * Saves `book`'s pages a few seconds after the last edit. Debounced rather
 * than on-every-keystroke to avoid hammering Supabase (Module 21: debounced
 * saving). Call `flush()` before navigating away or on manual Ctrl+S.
 */
export function useAutosave(book: EditorBook | null, dirty: boolean, delayMs = 2500) {
  const [state, setState] = useState<AutosaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookRef = useRef(book);
  bookRef.current = book;

  const flush = async () => {
    if (!bookRef.current) return;
    if (timer.current) clearTimeout(timer.current);
    setState("saving");
    try {
      await saveDraft(bookRef.current);
      setState("saved");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    if (!dirty || !book) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flush();
    }, delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, dirty, delayMs]);

  // Save on tab close / navigation so nothing typed in the last few seconds is lost.
  useEffect(() => {
    const onBeforeUnload = () => {
      if (dirty) void flush();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  return { state, flush };
}
