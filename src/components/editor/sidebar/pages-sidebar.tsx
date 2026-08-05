"use client";

import { useState, type DragEvent } from "react";
import { Plus, Copy, Trash2, GripVertical, FileText, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorPage, OutlineEntry } from "@/components/editor/types/editor";

interface PagesSidebarProps {
  pages: EditorPage[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: (afterPageId?: string) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onReorder: (pageIds: string[]) => void;
  outline: OutlineEntry[];
  bookTitle: string;
  coverUrl?: string;
}

type Tab = "pages" | "outline";

export function PagesSidebar({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorder,
  outline,
  bookTitle,
  coverUrl,
}: PagesSidebarProps) {
  const [tab, setTab] = useState<Tab>("pages");
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = pages.map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    onReorder(ids);
    setDragId(null);
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <div className="h-14 w-10 shrink-0 overflow-hidden rounded-sm bg-secondary">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{bookTitle || "Untitled book"}</p>
          <p className="text-xs text-muted-foreground">{pages.length} pages</p>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("pages")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium",
            tab === "pages" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          )}
        >
          <FileText className="h-3.5 w-3.5" /> Pages
        </button>
        <button
          type="button"
          onClick={() => setTab("outline")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium",
            tab === "outline" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          )}
        >
          <ListTree className="h-3.5 w-3.5" /> Outline
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === "pages" ? (
          <ul className="space-y-1">
            {pages.map((page) => (
              <li
                key={page.id}
                draggable
                onDragStart={() => setDragId(page.id)}
                onDragOver={(e: DragEvent) => e.preventDefault()}
                onDrop={() => handleDrop(page.id)}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
                  page.id === activePageId ? "bg-secondary text-primary" : "hover:bg-secondary/60"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" />
                <button type="button" className="flex-1 truncate text-left" onClick={() => onSelectPage(page.id)}>
                  <span className="mr-1.5 text-xs text-muted-foreground">{page.order}.</span>
                  {page.title || "Untitled"}
                </button>
                <button
                  type="button"
                  title="Duplicate page"
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-background group-hover:opacity-100"
                  onClick={() => onDuplicatePage(page.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete page"
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={() => onDeletePage(page.id)}
                  disabled={pages.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => onAddPage(activePageId ?? undefined)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary/60"
              >
                <Plus className="h-3.5 w-3.5" /> Add page
              </button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-0.5">
            {outline.length === 0 && <p className="px-2 py-1.5 text-xs text-muted-foreground">No headings yet.</p>}
            {outline.map((entry, i) => (
              <li key={`${entry.pageId}-${i}`}>
                <button
                  type="button"
                  onClick={() => onSelectPage(entry.pageId)}
                  className="w-full truncate rounded-md px-2 py-1 text-left text-sm hover:bg-secondary/60"
                  style={{ paddingLeft: `${8 + (entry.level - 1) * 12}px` }}
                >
                  {entry.text || "Untitled heading"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
