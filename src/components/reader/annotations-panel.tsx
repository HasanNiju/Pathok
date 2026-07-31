"use client";

import { useState } from "react";
import { Bookmark, Highlighter, StickyNote, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/home/empty-state";
import { useTranslation } from "@/hooks/use-translation";
import { ANNOTATION_COLOR_HEX } from "@/constants/reader";
import { cn } from "@/lib/utils";
import type { Chapter, ReaderAnnotation, ReaderBookmark } from "@/types/reader";

interface AnnotationsPanelProps {
  open: boolean;
  onClose: () => void;
  annotations: ReaderAnnotation[];
  bookmarks: ReaderBookmark[];
  chapters: Chapter[];
  onSelect: (annotation: ReaderAnnotation) => void;
  onRemove: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onSelectBookmark: (bookmark: ReaderBookmark) => void;
  onRemoveBookmark: (id: string) => void;
}

function AnnotationRow({
  annotation,
  chapterTitle,
  onSelect,
  onRemove,
  onSaveNote,
}: {
  annotation: ReaderAnnotation;
  chapterTitle: string;
  onSelect: () => void;
  onRemove: () => void;
  onSaveNote: (note: string) => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation.note ?? "");

  return (
    <li className="group rounded-lg border border-border p-3">
      <div className="flex items-start gap-2">
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: ANNOTATION_COLOR_HEX[annotation.color] }}
        />
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <p className="truncate text-xs font-bold text-primary">{chapterTitle}</p>
          <p className="line-clamp-3 text-sm">{annotation.text}</p>
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("reader.annotations.remove")}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity duration-200 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {editing ? (
        <div className="mt-2.5 flex flex-col gap-2 pl-5">
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("reader.annotations.notePlaceholder")}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onSaveNote(draft);
                setEditing(false);
              }}
            >
              {t("reader.annotations.saveNote")}
            </Button>
          </div>
        </div>
      ) : annotation.note ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ml-5 mt-2 flex items-start gap-1.5 rounded-md bg-secondary px-2.5 py-2 text-left text-sm text-secondary-foreground"
        >
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{annotation.note}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ml-5 mt-2 text-xs font-medium text-primary hover:underline"
        >
          {t("reader.annotations.addNote")}
        </button>
      )}
    </li>
  );
}

export function AnnotationsPanel({
  open,
  onClose,
  annotations,
  bookmarks,
  chapters,
  onSelect,
  onRemove,
  onSaveNote,
  onSelectBookmark,
  onRemoveBookmark,
}: AnnotationsPanelProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"highlights" | "notes" | "bookmarks">("highlights");

  const notes = annotations.filter((a) => !!a.note);
  const visible = tab === "highlights" ? annotations : notes;

  return (
    <Drawer open={open} onClose={onClose} title={t("reader.annotations.title")} side="right" className="max-w-sm">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 rounded-lg bg-secondary p-1">
          {(["highlights", "notes", "bookmarks"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-bold transition-colors duration-200",
                tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {key === "highlights"
                ? t("reader.annotations.highlightsTab")
                : key === "notes"
                  ? t("reader.annotations.notesTab")
                  : t("reader.bookmarks.title")}
            </button>
          ))}
        </div>

        {tab === "bookmarks" ? (
          bookmarks.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
              title={t("reader.bookmarks.empty")}
              description={t("reader.bookmarks.emptyDescription")}
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {bookmarks.map((bookmark) => {
                const chapter = chapters.find((c) => c.id === bookmark.chapterId);
                return (
                  <li key={bookmark.id} className="group flex items-start gap-2 rounded-lg px-1 py-1.5 hover:bg-secondary">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBookmark(bookmark);
                        onClose();
                      }}
                      className="flex-1 rounded-lg px-2 py-1.5 text-left"
                    >
                      <p className="truncate text-xs font-bold text-primary">
                        {chapter?.title.replace(/^\d+\.\s*/, "") ?? ""}
                      </p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{bookmark.excerpt}…</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(bookmark.id)}
                      aria-label={t("reader.bookmarks.remove")}
                      className="mt-1.5 shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity duration-200 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Highlighter className="h-5 w-5" aria-hidden="true" />}
            title={t("reader.annotations.empty")}
            description={
              tab === "highlights" ? t("reader.annotations.emptyHighlights") : t("reader.annotations.emptyNotes")
            }
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {visible.map((annotation) => (
              <AnnotationRow
                key={annotation.id}
                annotation={annotation}
                chapterTitle={
                  chapters.find((c) => c.id === annotation.chapterId)?.title.replace(/^\d+\.\s*/, "") ?? ""
                }
                onSelect={() => {
                  onSelect(annotation);
                  onClose();
                }}
                onRemove={() => onRemove(annotation.id)}
                onSaveNote={(note) => onSaveNote(annotation.id, note)}
              />
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
