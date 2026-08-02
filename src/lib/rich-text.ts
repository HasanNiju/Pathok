import sanitizeHtml from "sanitize-html";

/**
 * The Reader only ever renders `paragraphs_html` through
 * `dangerouslySetInnerHTML`, so what's allowed through here is the entire
 * XSS surface for book content. Keep it tight: bold/italic only, exactly
 * what the Reader's typography understands. Anything pasted from Word,
 * Google Docs, or a webpage — spans, inline styles, fonts, colors, images,
 * tables — gets stripped down to this on the way in, both for safety and
 * because carrying that markup into the DB would slow every page load for
 * every reader of the book, not just the editor.
 */
const ALLOWED_TAGS = ["b", "strong", "i", "em"];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {},
  // Collapse <strong>/<em> (what execCommand/contentEditable produce in
  // some browsers) onto the <b>/<i> pair the Reader's CSS already targets.
  transformTags: {
    strong: "b",
    em: "i",
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
