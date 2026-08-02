-- ============================================================
-- Pathok — formatted PDF extraction follow-up migration
-- Run this in the Supabase SQL Editor (after migration_v2_pdf_native.sql).
-- ============================================================

-- PDFs are now text-extracted with their bold/italic/heading formatting
-- preserved (see extractFormattedFromPdf), instead of shown as raw page
-- images. That formatted form is stored alongside the existing plain-text
-- `paragraphs` column (which still drives search, Read Aloud, and bookmark
-- excerpts) so the Reader can render it. Existing chapters (extracted
-- before this shipped) simply have paragraphs_html = null, and the Reader
-- falls back to plain text for those.
alter table book_chapters add column if not exists paragraphs_html jsonb;
