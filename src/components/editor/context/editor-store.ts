"use client";

import { useReducer, useCallback, useMemo } from "react";
import type { EditorBook, EditorPage, EditorBookStatus, PMContent } from "@/components/editor/types/editor";
import { EMPTY_DOC } from "@/components/editor/types/editor";

let uidCounter = 0;
export const nextPageId = () => `pg_${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

type Action =
  | { type: "SET_BOOK"; book: EditorBook }
  | { type: "SET_ACTIVE_PAGE"; pageId: string }
  | { type: "UPDATE_PAGE_CONTENT"; pageId: string; content: PMContent }
  | { type: "SET_PAGE_TITLE"; pageId: string; title: string }
  | { type: "ADD_PAGE"; afterPageId?: string }
  | { type: "DELETE_PAGE"; pageId: string }
  | { type: "DUPLICATE_PAGE"; pageId: string }
  | { type: "REORDER_PAGES"; pageIds: string[] }
  | { type: "MARK_SAVED"; at: string }
  | { type: "SET_STATUS"; status: EditorBookStatus }
  | { type: "PUBLISH" };

interface State {
  book: EditorBook | null;
  activePageId: string | null;
  dirty: boolean;
}

function renumber(pages: EditorPage[]): EditorPage[] {
  return pages.map((p, i) => ({ ...p, order: i + 1 }));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BOOK":
      return { book: action.book, activePageId: action.book.pages[0]?.id ?? null, dirty: false };
    case "SET_ACTIVE_PAGE":
      return { ...state, activePageId: action.pageId };
    case "UPDATE_PAGE_CONTENT": {
      if (!state.book) return state;
      const pages = state.book.pages.map((p) =>
        p.id === action.pageId
          ? { ...p, draftContent: action.content, status: "draft" as const, updatedAt: new Date().toISOString() }
          : p
      );
      return { ...state, book: { ...state.book, pages }, dirty: true };
    }
    case "SET_PAGE_TITLE": {
      if (!state.book) return state;
      const pages = state.book.pages.map((p) => (p.id === action.pageId ? { ...p, title: action.title } : p));
      return { ...state, book: { ...state.book, pages }, dirty: true };
    }
    case "ADD_PAGE": {
      if (!state.book) return state;
      const insertAt = action.afterPageId
        ? state.book.pages.findIndex((p) => p.id === action.afterPageId) + 1
        : state.book.pages.length;
      const now = new Date().toISOString();
      const newPage: EditorPage = {
        id: nextPageId(),
        bookId: state.book.bookId,
        order: insertAt + 1,
        title: "Untitled page",
        draftContent: EMPTY_DOC,
        publishedContent: null,
        status: "empty",
        createdAt: now,
        updatedAt: now,
      };
      const pages = [...state.book.pages];
      pages.splice(insertAt, 0, newPage);
      return { ...state, book: { ...state.book, pages: renumber(pages) }, activePageId: newPage.id, dirty: true };
    }
    case "DELETE_PAGE": {
      if (!state.book || state.book.pages.length <= 1) return state;
      const idx = state.book.pages.findIndex((p) => p.id === action.pageId);
      const pages = renumber(state.book.pages.filter((p) => p.id !== action.pageId));
      const nextActive =
        state.activePageId === action.pageId ? pages[Math.max(0, idx - 1)]?.id ?? null : state.activePageId;
      return { ...state, book: { ...state.book, pages }, activePageId: nextActive, dirty: true };
    }
    case "DUPLICATE_PAGE": {
      if (!state.book) return state;
      const idx = state.book.pages.findIndex((p) => p.id === action.pageId);
      const original = state.book.pages[idx];
      if (idx === -1 || !original) return state;
      const now = new Date().toISOString();
      const copy: EditorPage = {
        ...original,
        id: nextPageId(),
        title: `${original.title} (copy)`,
        publishedContent: null,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      const pages = [...state.book.pages];
      pages.splice(idx + 1, 0, copy);
      return { ...state, book: { ...state.book, pages: renumber(pages) }, activePageId: copy.id, dirty: true };
    }
    case "REORDER_PAGES": {
      if (!state.book) return state;
      const byId = new Map(state.book.pages.map((p) => [p.id, p]));
      const pages = renumber(action.pageIds.map((id) => byId.get(id)).filter((p): p is EditorPage => Boolean(p)));
      return { ...state, book: { ...state.book, pages }, dirty: true };
    }
    case "MARK_SAVED":
      if (!state.book) return state;
      return { ...state, book: { ...state.book, lastSavedAt: action.at }, dirty: false };
    case "SET_STATUS":
      if (!state.book) return state;
      return { ...state, book: { ...state.book, status: action.status } };
    case "PUBLISH": {
      if (!state.book) return state;
      const pages = state.book.pages.map((p) => ({
        ...p,
        publishedContent: p.draftContent,
        status: "ready" as const,
      }));
      return { ...state, book: { ...state.book, pages, status: "published" } };
    }
    default:
      return state;
  }
}

export function useEditorStore(initialBook: EditorBook | null) {
  const [state, dispatch] = useReducer(reducer, {
    book: initialBook,
    activePageId: initialBook?.pages[0]?.id ?? null,
    dirty: false,
  });

  const activePage = useMemo(
    () => state.book?.pages.find((p) => p.id === state.activePageId) ?? null,
    [state.book, state.activePageId]
  );

  const actions = {
    setBook: useCallback((book: EditorBook) => dispatch({ type: "SET_BOOK", book }), []),
    setActivePage: useCallback((pageId: string) => dispatch({ type: "SET_ACTIVE_PAGE", pageId }), []),
    updatePageContent: useCallback(
      (pageId: string, content: PMContent) => dispatch({ type: "UPDATE_PAGE_CONTENT", pageId, content }),
      []
    ),
    setPageTitle: useCallback((pageId: string, title: string) => dispatch({ type: "SET_PAGE_TITLE", pageId, title }), []),
    addPage: useCallback((afterPageId?: string) => dispatch({ type: "ADD_PAGE", afterPageId }), []),
    deletePage: useCallback((pageId: string) => dispatch({ type: "DELETE_PAGE", pageId }), []),
    duplicatePage: useCallback((pageId: string) => dispatch({ type: "DUPLICATE_PAGE", pageId }), []),
    reorderPages: useCallback((pageIds: string[]) => dispatch({ type: "REORDER_PAGES", pageIds }), []),
    markSaved: useCallback((at: string) => dispatch({ type: "MARK_SAVED", at }), []),
    setStatus: useCallback((status: EditorBookStatus) => dispatch({ type: "SET_STATUS", status }), []),
    publish: useCallback(() => dispatch({ type: "PUBLISH" }), []),
  };

  return { book: state.book, activePage, activePageId: state.activePageId, dirty: state.dirty, ...actions };
}

export type EditorStoreApi = ReturnType<typeof useEditorStore>;
