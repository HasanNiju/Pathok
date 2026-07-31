"use client";

import { useCallback, useEffect, useState } from "react";
import { READER_STORAGE_KEYS } from "@/constants/reader";
import type { AnnotationColor, ReaderAnnotation } from "@/types/reader";

function storageKey(userId: string | undefined, bookId: string) {
  return `${READER_STORAGE_KEYS.annotations}:${userId ?? "guest"}:${bookId}`;
}

function readAll(userId: string | undefined, bookId: string): ReaderAnnotation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId, bookId));
    return raw ? (JSON.parse(raw) as ReaderAnnotation[]) : [];
  } catch {
    return [];
  }
}

/**
 * Highlights and notes for one book. A "note" is simply a highlight with
 * commentary attached (annotation.note is set) — this mirrors how Kindle
 * itself models the two, so one store and one panel covers both features.
 * Persisted per user+book, same localStorage pattern as favorites/bookmarks.
 */
export function useReaderAnnotations(userId: string | undefined, bookId: string) {
  const [annotations, setAnnotations] = useState<ReaderAnnotation[]>([]);

  useEffect(() => {
    setAnnotations(readAll(userId, bookId));
  }, [userId, bookId]);

  const persist = useCallback(
    (next: ReaderAnnotation[]) => {
      setAnnotations(next);
      try {
        window.localStorage.setItem(storageKey(userId, bookId), JSON.stringify(next));
      } catch {
        // Best-effort persistence only.
      }
    },
    [userId, bookId]
  );

  const addAnnotation = useCallback(
    (chapterId: string, paragraphIndex: number, text: string, color: AnnotationColor, note?: string) => {
      const annotation: ReaderAnnotation = {
        id: `an-${Date.now()}`,
        bookId,
        chapterId,
        paragraphIndex,
        color,
        text,
        note,
        createdAt: new Date().toISOString(),
      };
      persist([annotation, ...annotations]);
      return annotation;
    },
    [annotations, bookId, persist]
  );

  const updateAnnotationNote = useCallback(
    (id: string, note: string) => {
      persist(annotations.map((a) => (a.id === id ? { ...a, note: note || undefined } : a)));
    },
    [annotations, persist]
  );

  const removeAnnotation = useCallback(
    (id: string) => persist(annotations.filter((a) => a.id !== id)),
    [annotations, persist]
  );

  const forParagraph = useCallback(
    (chapterId: string, paragraphIndex: number) =>
      annotations.filter((a) => a.chapterId === chapterId && a.paragraphIndex === paragraphIndex),
    [annotations]
  );

  const notes = annotations.filter((a) => !!a.note);
  const highlights = annotations;

  return {
    annotations,
    highlights,
    notes,
    addAnnotation,
    updateAnnotationNote,
    removeAnnotation,
    forParagraph,
  };
}
