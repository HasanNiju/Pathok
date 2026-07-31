"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/** Toggles the Fullscreen API on the given element ref and tracks whether
 *  it's currently active (including exits triggered by Esc or the browser
 *  chrome, not just our own toggle button). */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [ref]);

  const enter = useCallback(async () => {
    try {
      await ref.current?.requestFullscreen();
    } catch {
      // Fullscreen can be denied by the browser/user — reading still works without it.
    }
  }, [ref]);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore — nothing more we can do if the browser refuses.
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      exit();
    } else {
      enter();
    }
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
