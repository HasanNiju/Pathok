import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import type { Extensions } from "@tiptap/core";

/**
 * Full Module 4 extension set. StarterKit already ships Bold, Italic, Strike,
 * Code, CodeBlock, Blockquote, BulletList, OrderedList, Heading, Paragraph,
 * HardBreak, History, Dropcursor and Gapcursor — only what it doesn't cover
 * is added explicitly below.
 */
export function buildExtensions(placeholder = "Start writing…"): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: "editor-image" } }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "editor-link" } }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    Superscript,
    Subscript,
    Typography,
    Placeholder.configure({ placeholder }),
    CharacterCount,
  ];
}
