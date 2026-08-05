"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { EditorProvider, useEditorContext } from "@/components/editor/context/editor-context";
import { EditorToolbar } from "@/components/editor/toolbar/editor-toolbar";
import { PagesSidebar } from "@/components/editor/sidebar/pages-sidebar";
import { EditorPageCanvas } from "@/components/editor/page/editor-page";
import { StatusBar } from "@/components/editor/status-bar";
import { PreviewPanel } from "@/components/editor/preview/preview-panel";
import { ImageDialog } from "@/components/editor/dialogs/image-dialog";
import { TableDialog } from "@/components/editor/dialogs/table-dialog";
import { FindReplaceDialog } from "@/components/editor/dialogs/find-replace-dialog";
import { PdfImportDialog } from "@/components/editor/pdf-import/pdf-import-dialog";
import { useAutosave } from "@/components/editor/hooks/use-autosave";
import { useKeyboardShortcuts } from "@/components/editor/hooks/use-keyboard-shortcuts";
import { useBookStats, useActivePageStats } from "@/components/editor/hooks/use-word-stats";
import { buildOutline } from "@/components/editor/utils/outline";
import { loadEditorBook, publishBook, replaceAllPages } from "@/lib/supabase/editor-service";
import type { EditorBook } from "@/components/editor/types/editor";

interface BookEditorProps {
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
}

export function BookEditor(props: BookEditorProps) {
  const [initialBook, setInitialBook] = useState<EditorBook | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadEditorBook(props.bookId)
      .then((book) => !cancelled && setInitialBook(book))
      .catch(() => !cancelled && setLoadError("Couldn't load this book's editor content."));
    return () => {
      cancelled = true;
    };
  }, [props.bookId]);

  if (loadError) {
    return <div className="flex h-screen items-center justify-center text-sm text-destructive">{loadError}</div>;
  }
  if (!initialBook) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading editor…</div>;
  }

  return (
    <EditorProvider initialBook={initialBook}>
      <BookEditorInner {...props} />
    </EditorProvider>
  );
}

function BookEditorInner({ bookId, bookTitle, coverUrl }: BookEditorProps) {
  const router = useRouter();
  const store = useEditorContext();
  const { book, activePage, activePageId } = store;

  const [zoom, setZoom] = useState(100);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(!book?.pages.some((p) => p.status !== "empty"));
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const { state: autosaveState, flush } = useAutosave(book, store.dirty);
  const bookStats = useBookStats(book?.pages ?? []);
  const activeStats = useActivePageStats(activeEditor);
  const outline = buildOutline(book?.pages ?? []);

  useKeyboardShortcuts({
    onSave: () => void flush(),
    onPublish: () => void handlePublish(),
    onFind: () => setFindOpen(true),
    onPreviewToggle: () => setPreviewOpen((v) => !v),
  });

  const handlePublish = async () => {
    if (!book) return;
    store.publish();
    await publishBook({ ...book, pages: book.pages.map((p) => ({ ...p, publishedContent: p.draftContent, status: "ready" })) });
  };

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
        <button
          type="button"
          onClick={() => {
            void flush();
            router.back();
          }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="h-5 w-px bg-border" />
        <p className="truncate text-sm font-medium">{bookTitle}</p>
        <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] capitalize text-muted-foreground">{book.status}</span>
        <button
          type="button"
          onClick={() => setPdfDialogOpen(true)}
          className="ml-auto text-xs text-muted-foreground hover:text-primary"
        >
          Re-import from PDF
        </button>
      </div>

      <EditorToolbar
        editor={activeEditor}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenImageDialog={() => setImageDialogOpen(true)}
        onOpenTableDialog={() => setTableDialogOpen(true)}
        onOpenFind={() => setFindOpen(true)}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
        onSave={() => void flush()}
        onPublish={() => void handlePublish()}
        saving={autosaveState === "saving"}
        previewOpen={previewOpen}
      />

      <div className="flex min-h-0 flex-1">
        <PagesSidebar
          pages={book.pages}
          activePageId={activePageId}
          onSelectPage={store.setActivePage}
          onAddPage={store.addPage}
          onDeletePage={store.deletePage}
          onDuplicatePage={store.duplicatePage}
          onReorder={store.reorderPages}
          outline={outline}
          bookTitle={bookTitle}
          coverUrl={coverUrl}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          {activePage && (
            <EditorPageCanvas
              key={activePage.id}
              page={activePage}
              zoom={zoom}
              onContentChange={(content) => store.updatePageContent(activePage.id, content)}
              onEditorReady={setActiveEditor}
            />
          )}
        </main>

        {previewOpen && (
          <div className="w-[420px] shrink-0">
            <PreviewPanel page={activePage} onClose={() => setPreviewOpen(false)} />
          </div>
        )}
      </div>

      <StatusBar
        activePageOrder={activePage?.order ?? 0}
        totalPages={book.pages.length}
        words={activeStats.words}
        characters={activeStats.characters}
        readingMinutes={bookStats.readingMinutes}
        autosave={autosaveState}
        lastSavedAt={book.lastSavedAt}
      />

      <ImageDialog editor={activeEditor} open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} bookId={bookId} />
      <TableDialog editor={activeEditor} open={tableDialogOpen} onClose={() => setTableDialogOpen(false)} />
      <FindReplaceDialog
        open={findOpen}
        onClose={() => setFindOpen(false)}
        pages={book.pages}
        activeEditor={activeEditor}
        activePageId={activePageId}
        onJumpToPage={store.setActivePage}
      />
      <PdfImportDialog
        open={pdfDialogOpen}
        onClose={() => setPdfDialogOpen(false)}
        bookId={bookId}
        onImported={(pages) => {
          store.setBook({ ...book, pages });
          void replaceAllPages(bookId, pages);
        }}
      />
    </div>
  );
}
