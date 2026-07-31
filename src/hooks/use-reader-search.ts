"use client";

import { useMemo, useState } from "react";
import type { Chapter, ReaderSearchResult } from "@/types/reader";

const SNIPPET_RADIUS = 40;

function buildSnippet(paragraph: string, matchIndex: number, queryLength: number): string {
  const start = Math.max(0, matchIndex - SNIPPET_RADIUS);
  const end = Math.min(paragraph.length, matchIndex + queryLength + SNIPPET_RADIUS);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < paragraph.length ? "…" : "";
  return `${prefix}${paragraph.slice(start, end).trim()}${suffix}`;
}

/** Simple case-insensitive full-text search across every paragraph in the
 *  book. Results carry the chapter + paragraph index; the reader resolves
 *  that to a concrete page once it knows the current pagination layout. */
export function useReaderSearch(chapters: Chapter[]) {
  const [query, setQuery] = useState("");

  const results = useMemo<ReaderSearchResult[]>(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];

    const hits: ReaderSearchResult[] = [];
    for (const chapter of chapters) {
      chapter.paragraphs.forEach((paragraph, paragraphIndex) => {
        const matchIndex = paragraph.toLowerCase().indexOf(normalized);
        if (matchIndex === -1) return;
        hits.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          paragraphIndex,
          pageIndex: 0, // resolved by the caller once pagination is known
          snippet: buildSnippet(paragraph, matchIndex, normalized.length),
        });
      });
    }
    return hits.slice(0, 50);
  }, [chapters, query]);

  return { query, setQuery, results };
}
