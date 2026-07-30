"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `handler` when a mousedown occurs outside the given ref's element.
 * Used by Dropdown (and any future popover-style component) to close on
 * outside click.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}
