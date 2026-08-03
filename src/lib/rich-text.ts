import sanitizeHtml from "sanitize-html";

/**
 * The Reader only ever renders `paragraphs_html` through
 * `dangerouslySetInnerHTML`, so what's allowed through here is the entire
 * XSS surface for book content. Keep it tight: bold/italic/underline/
 * strikethrough only — exactly what the editor's toolbar can produce and
 * what the Reader's typography understands (the browser's own UA
 * stylesheet renders <u>/<s> correctly with zero extra Reader CSS).
 * Anything pasted from Word, Google Docs, or a webpage — spans, inline
 * styles, fonts, colors, images, tables — gets stripped down to this on
 * the way in, both for safety and because carrying that markup into the
 * DB would slow every page load for every reader of the book, not just
 * the editor.
 */
const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "s", "strike", "del"];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {},
  // Collapse the various tags execCommand/contentEditable produce across
  // browsers onto the single pair the Reader (and this sanitizer) target.
  transformTags: {
    strong: "b",
    em: "i",
    strike: "s",
    del: "s",
  },
  exclusiveFilter: (frame) => frame.tag === "br",
};

/** Sanitizes one paragraph's inline HTML down to bold/italic only. */
export function sanitizeParagraphHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

/** Strips all markup, collapsing whitespace — the plain-text twin of
 *  `paragraphs_html` that drives search, Read Aloud, and bookmark excerpts. */
export function htmlToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** True once a contentEditable block has real text in it — guards against
 *  the empty `<p><br></p>` / `<div><br></div>` browsers leave behind. */
export function isBlankParagraphHtml(html: string): boolean {
  return htmlToPlainText(html).length === 0;
}
