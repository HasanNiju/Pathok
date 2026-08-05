"use client";

import type { AutosaveState } from "@/components/editor/hooks/use-autosave";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  activePageOrder: number;
  totalPages: number;
  words: number;
  characters: number;
  readingMinutes: number;
  autosave: AutosaveState;
  lastSavedAt: string | null;
}

const LABEL: Record<AutosaveState, string> = {
  idle: "All changes saved",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save — retrying",
};

export function StatusBar({ activePageOrder, totalPages, words, characters, readingMinutes, autosave, lastSavedAt }: StatusBarProps) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-background px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>
          Page {activePageOrder} of {totalPages}
        </span>
        <span>{words} words</span>
        <span>{characters} characters</span>
        <span>~{readingMinutes} min read</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            autosave === "saved" || autosave === "idle" ? "bg-emerald-500" : autosave === "saving" ? "bg-amber-500" : "bg-destructive"
          )}
        />
        <span>{LABEL[autosave]}</span>
        {lastSavedAt && autosave !== "saving" && (
          <span className="text-muted-foreground/70">· {new Date(lastSavedAt).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
