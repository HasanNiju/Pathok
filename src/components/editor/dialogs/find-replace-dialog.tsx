"use client";

import { useState, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { DialogShell } from "@/components/editor/dialogs/dialog-shell";
import { Button } from "@/components/ui/button";
import { searchPages, replaceAllInEditor } from "@/components/editor/utils/search";
import type { EditorPage } from "@/components/editor/types/editor";

interface Props {
  open: boolean;
  onClose: () => void;
  pages: EditorPage[];
  activeEditor: Editor | null;
  activePageId: string | null;
  onJumpToPage: (pageId: string) => void;
}

export function FindReplaceDialog({ open, onClose, pages, activeEditor, activePageId, onJumpToPage }: Props) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regex, setRegex] = useState(false);

  const hits = useMemo(
    () => searchPages(pages, query, { caseSensitive, wholeWord, regex }),
    [pages, query, caseSensitive, wholeWord, regex]
  );

  const replaceOnActivePage = () => {
    if (!activeEditor) return;
    replaceAllInEditor(activeEditor, query, replacement, { caseSensitive, wholeWord, regex });
  };

  return (
    <DialogShell title="Find & replace" open={open} onClose={onClose} width="max-w-lg">
      <div className="space-y-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find…"
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
        />
        <input
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder="Replace with…"
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Case sensitive
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} /> Whole word
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} /> Regex
          </label>
        </div>

        <div className="max-h-56 overflow-y-auto rounded-md border border-border">
          {hits.length === 0 && query && <p className="p-3 text-xs text-muted-foreground">No matches.</p>}
          {hits.map((hit, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onJumpToPage(hit.pageId)}
              className="block w-full border-b border-border px-3 py-2 text-left text-xs last:border-b-0 hover:bg-secondary/60"
            >
              <span className="font-medium">Page {hit.pageOrder}</span> — …{hit.snippet}…
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">{hits.length} match{hits.length === 1 ? "" : "es"}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" disabled={!query || !activePageId} onClick={replaceOnActivePage}>
              Replace on this page
            </Button>
          </div>
        </div>
      </div>
    </DialogShell>
  );
}
