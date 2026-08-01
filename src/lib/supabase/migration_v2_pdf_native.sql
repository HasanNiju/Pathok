-- ============================================================
-- Pathok — PDF-native reader follow-up migration
-- Run this in the Supabase SQL Editor (after migration_v1_mvp.sql).
-- ============================================================

-- The native PDF reader loads the uploaded file directly via a public URL
-- (the same pattern already used for book covers and branding assets) —
-- so PDF files need to be publicly readable, not locked behind admin-only
-- access. DOCX source files stay in the same bucket for record-keeping;
-- they're never read directly by the app since DOCX still uses the
-- extracted-text Reader.
update storage.buckets set public = true where id = 'book-files';
