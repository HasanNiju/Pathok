"use client";

import { useEffect, useState } from "react";

/**
 * Generic media query hook, e.g. useMediaQuery("(min-width: 768px)").
 * Returns false on the server and during first client render to avoid
 * hydration mismatches, then syncs to the real value after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
