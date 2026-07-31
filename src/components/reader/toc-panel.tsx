"use client";

import { Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types/reader";

interface TocPanelProps {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
}

export function TocPanel({ open, onClose, chapters, currentChapterId, onSelectChapter }: TocPanelProps) {
  const { t } = useTranslation();
  const currentIndex = chapters.findIndex((c) => c.id === currentChapterId);

  return (
    <Drawer open={open} onClose={onClose} title={t("reader.toc.title")} side="left" className="max-w-sm">
      <ul className="flex flex-col gap-1">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === currentChapterId;
          const isRead = index < currentIndex;

          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => {
                  onSelectChapter(chapter.id);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-200",
                  isActive ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isRead
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {isRead ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : chapter.order}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{chapter.title.replace(/^\d+\.\s*/, "")}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
}
