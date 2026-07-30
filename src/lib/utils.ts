import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 * Used by every component instead of hand-concatenating className strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
