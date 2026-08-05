"use client";

import { useState } from "react";
import { UploadCloud, Loader2, AlertTriangle } from "lucide-react";
import { DialogShell } from "@/components/editor/dialogs/dialog-shell";
import { Button } from "@/components/ui/button";
import { extractPdfToPages } from "@/lib/pdf/extract-pdf";
import type { EditorPage } from "@/components/editor/types/editor";

interface Props {
  open: boolean;
  onClose: () => void;
  bookId: string;
  onImported: (pages: EditorPage[]) => void;
}

export function PdfImportDialog({ open, onClose, bookId, onImported }: Props) {
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    setProgress({ page: 0, total: 1 });
    try {
      const pages = await extractPdfToPages(file, bookId, (p) => setProgress({ page: p.page, total: p.totalPages }));
      onImported(pages);
      onClose();
    } catch {
      setError("Couldn't read that PDF. It may be scanned/image-only or corrupted.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <DialogShell title="Import from PDF" open={open} onClose={onClose}>
      <div className="space-y-4">
        {!progress ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center hover:bg-secondary/40">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">Click to choose a PDF, or drag it here</span>
            <span className="text-xs text-muted-foreground">Text is extracted automatically; each PDF page becomes one editable page.</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">
              Extracting page {progress.page} of {progress.total}…
            </p>
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.total ? (progress.page / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
