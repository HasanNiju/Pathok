"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { DialogShell } from "@/components/editor/dialogs/dialog-shell";
import { Button } from "@/components/ui/button";
import { uploadEditorImage } from "@/lib/supabase/editor-service";

export function ImageDialog({ editor, open, onClose, bookId }: { editor: Editor | null; open: boolean; onClose: () => void; bookId: string }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = (src: string) => {
    editor?.chain().focus().setImage({ src, alt }).run();
    setUrl("");
    setAlt("");
    onClose();
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const publicUrl = await uploadEditorImage(bookId, file);
      insert(publicUrl);
    } catch {
      setError("Upload failed. Try a smaller image or check your connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogShell title="Insert image" open={open} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Upload from device</label>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="block w-full text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or paste a URL <div className="h-px flex-1 bg-border" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Image URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Caption / alt text</label>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={uploading} disabled={!url} onClick={() => insert(url)}>
            Insert
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
