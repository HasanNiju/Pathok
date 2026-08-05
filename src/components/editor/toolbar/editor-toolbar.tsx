"use client";

import type { Editor } from "@tiptap/react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Minus,
  ImageIcon,
  TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Eraser,
  Eye,
  Save,
  UploadCloud,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  editor: Editor | null;
  zoom: number;
  onZoomChange: (z: number) => void;
  onOpenImageDialog: () => void;
  onOpenTableDialog: () => void;
  onOpenFind: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
  onPublish: () => void;
  saving: boolean;
  previewOpen: boolean;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors",
        "hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-secondary text-primary"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />;
}

export function EditorToolbar({
  editor,
  zoom,
  onZoomChange,
  onOpenImageDialog,
  onOpenTableDialog,
  onOpenFind,
  onTogglePreview,
  onSave,
  onPublish,
  saving,
  previewOpen,
}: ToolbarProps) {
  const chain = () => editor?.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting toolbar"
      className="sticky top-0 z-20 flex h-14 items-center gap-1 overflow-x-auto border-b border-border bg-background/95 px-3 backdrop-blur"
    >
      <ToolbarButton title="Undo (Ctrl+Z)" disabled={!editor?.can().undo()} onClick={() => chain()?.undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo (Ctrl+Y)" disabled={!editor?.can().redo()} onClick={() => chain()?.redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <select
        aria-label="Block type"
        className="h-9 shrink-0 rounded-md border border-border bg-transparent px-2 text-sm"
        value={
          editor?.isActive("heading", { level: 1 })
            ? "h1"
            : editor?.isActive("heading", { level: 2 })
            ? "h2"
            : editor?.isActive("heading", { level: 3 })
            ? "h3"
            : "p"
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") chain()?.setParagraph().run();
          else chain()?.setHeading({ level: Number(v[1]) as 1 | 2 | 3 }).run();
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <Divider />

      <ToolbarButton title="Bold (Ctrl+B)" active={editor?.isActive("bold")} onClick={() => chain()?.toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic (Ctrl+I)" active={editor?.isActive("italic")} onClick={() => chain()?.toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Underline (Ctrl+U)" active={editor?.isActive("underline")} onClick={() => chain()?.toggleUnderline().run()}>
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor?.isActive("strike")} onClick={() => chain()?.toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Highlight" active={editor?.isActive("highlight")} onClick={() => chain()?.toggleHighlight().run()}>
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={editor?.isActive("code")} onClick={() => chain()?.toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={editor?.isActive("bulletList")} onClick={() => chain()?.toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Ordered list" active={editor?.isActive("orderedList")} onClick={() => chain()?.toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Checklist" active={editor?.isActive("taskList")} onClick={() => chain()?.toggleTaskList().run()}>
        <ListChecks className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor?.isActive("blockquote")} onClick={() => chain()?.toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Horizontal rule" onClick={() => chain()?.setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Align left" active={editor?.isActive({ textAlign: "left" })} onClick={() => chain()?.setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Align center" active={editor?.isActive({ textAlign: "center" })} onClick={() => chain()?.setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Align right" active={editor?.isActive({ textAlign: "right" })} onClick={() => chain()?.setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Insert image" onClick={onOpenImageDialog}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert table" onClick={onOpenTableDialog}>
        <TableIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Clear formatting" onClick={() => chain()?.clearNodes().unsetAllMarks().run()}>
        <Eraser className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Find & replace (Ctrl+F)" onClick={onOpenFind}>
        <Search className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Zoom out" onClick={() => onZoomChange(Math.max(70, zoom - 10))}>
        <ZoomOut className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-10 shrink-0 text-center text-xs text-muted-foreground">{zoom}%</span>
      <ToolbarButton title="Zoom in" onClick={() => onZoomChange(Math.min(150, zoom + 10))}>
        <ZoomIn className="h-4 w-4" />
      </ToolbarButton>

      <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
        <button
          type="button"
          onClick={onTogglePreview}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
            previewOpen ? "bg-secondary text-primary" : "text-foreground/70 hover:bg-secondary"
          )}
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <UploadCloud className="h-4 w-4" /> Publish
        </button>
      </div>
    </div>
  );
}
