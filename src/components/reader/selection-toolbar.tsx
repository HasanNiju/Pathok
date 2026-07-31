"use client";

import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import { ANNOTATION_COLOR_HEX } from "@/constants/reader";
import { useTranslation } from "@/hooks/use-translation";
import type { AnnotationColor } from "@/types/reader";

interface SelectionToolbarProps {
  rect: DOMRect;
  onPickColor: (color: AnnotationColor) => void;
  onAddNote: () => void;
}

const COLORS: AnnotationColor[] = ["yellow", "green", "blue", "pink"];

export function SelectionToolbar({ rect, onPickColor, onAddNote }: SelectionToolbarProps) {
  const { t } = useTranslation();

  // Position just above the selection, clamped so it stays on-screen.
  const top = Math.max(8, rect.top - 52);
  const left = Math.min(Math.max(8, rect.left + rect.width / 2 - 90), window.innerWidth - 188);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      style={{ position: "fixed", top, left, zIndex: 80 }}
      className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 shadow-soft-lg"
    >
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onPickColor(color)}
          aria-label={`${t("reader.selectionToolbar.highlight")} ${color}`}
          className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/10 transition-transform duration-150 hover:scale-110"
          style={{ backgroundColor: ANNOTATION_COLOR_HEX[color] }}
        />
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        onClick={onAddNote}
        aria-label={t("reader.selectionToolbar.addNote")}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-secondary"
      >
        <StickyNote className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
