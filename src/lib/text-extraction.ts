diff --git a/src/lib/text-extraction.ts b/src/lib/text-extraction.ts
index 7241bbe..ca5fa3e 100644
--- a/src/lib/text-extraction.ts
+++ b/src/lib/text-extraction.ts
@@ -11,6 +11,74 @@ function looksLikeHeading(line: string): boolean {
 
 const PARAGRAPHS_PER_FALLBACK_CHAPTER = 25;
 
+/**
+ * Recovers paragraph breaks from a plain-text dump that has NO blank-line
+ * signal at all — typical of pdf-parse output, which usually keeps one
+ * newline per visual PDF line but rarely a blank line between paragraphs.
+ * Without this, everything downstream collapses into one giant paragraph.
+ *
+ * Heuristic: a line that's noticeably shorter than the block's typical
+ * line width AND ends in sentence-final punctuation is almost always the
+ * last line of a paragraph in a justified/wrapped PDF — a full mid-paragraph
+ * line runs to the margin, a paragraph's last line usually doesn't. A line
+ * that looks like a heading is always its own block regardless.
+ */
+function splitByLineLengthHeuristic(rawText: string): string[] {
+  const lines = rawText
+    .split(/\r?\n/)
+    .map((l) => l.trim())
+    .filter(Boolean);
+  if (lines.length === 0) return [];
+
+  const lineLengths = lines.map((l) => l.length).sort((a, b) => a - b);
+  const typicalLineLength = lineLengths[Math.floor(lineLengths.length * 0.75)] || 80;
+
+  const blocks: string[] = [];
+  let buffer: string[] = [];
+
+  const flush = () => {
+    if (buffer.length === 0) return;
+    blocks.push(buffer.join(" ").replace(/\s+/g, " ").trim());
+    buffer = [];
+  };
+
+  for (const line of lines) {
+    if (looksLikeHeading(line)) {
+      flush();
+      blocks.push(line);
+      continue;
+    }
+    buffer.push(line);
+    const endsSentence = /["'”’]?[.!?]["'”’]?$/.test(line);
+    const isShortLine = line.length < typicalLineLength * 0.75;
+    if (endsSentence && isShortLine) flush();
+  }
+  flush();
+
+  return blocks.filter(Boolean);
+}
+
+/**
+ * Splits raw extracted text into paragraph-level blocks. Prefers
+ * blank-line-delimited paragraphs (the normal case for DOCX and
+ * well-formed PDF text); falls back to the line-length heuristic above
+ * when the blank-line split clearly found no real paragraph signal (too
+ * few blocks, or blocks so long they can only be several paragraphs
+ * mashed together).
+ */
+function splitIntoParagraphBlocks(rawText: string): string[] {
+  const blankLineBlocks = rawText
+    .split(/\r?\n\s*\r?\n/)
+    .map((p) => p.replace(/\s+/g, " ").trim())
+    .filter(Boolean);
+
+  const avgBlockLen = blankLineBlocks.reduce((sum, p) => sum + p.length, 0) / (blankLineBlocks.length || 1);
+  if (blankLineBlocks.length < 3 || avgBlockLen > 1200) {
+    return splitByLineLengthHeuristic(rawText);
+  }
+  return blankLineBlocks;
+}
+
 /**
  * Splits raw extracted text into chapters. Prefers detected headings
  * ("Chapter 1", "Prologue", ALL-CAPS section titles); falls back to
@@ -20,10 +88,7 @@ const PARAGRAPHS_PER_FALLBACK_CHAPTER = 25;
  * for the PDF path, which does have that signal).
  */
 export function chunkIntoChapters(rawText: string, bookId: string): Chapter[] {
-  const paragraphs = rawText
-    .split(/\r?\n\s*\r?\n/)
-    .map((p) => p.replace(/\s+/g, " ").trim())
-    .filter(Boolean);
+  const paragraphs = splitIntoParagraphBlocks(rawText);
 
   if (paragraphs.length === 0) return [];