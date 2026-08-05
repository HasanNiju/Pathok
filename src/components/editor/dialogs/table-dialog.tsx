"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { DialogShell } from "@/components/editor/dialogs/dialog-shell";
import { Button } from "@/components/ui/button";

export function TableDialog({ editor, open, onClose }: { editor: Editor | null; open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);

  const insert = () => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run();
    onClose();
  };

  return (
    <DialogShell title="Insert table" open={open} onClose={onClose} width="max-w-sm">
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Rows</label>
            <input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Columns</label>
            <input
              type="number"
              min={1}
              max={10}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} />
          Header row
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={insert}>
            Insert table
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
