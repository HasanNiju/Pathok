# Pathok Editor v2 — drop-in package

## 1. Copy files
Copy everything under `src/` in this package into your repo's `src/`,
preserving paths — it's a straight overlay, nothing overwrites existing files
except `package.json` (merge the new deps in manually if you don't want to
replace your file wholesale — the diff is only the added `dependencies`).

New paths added:
```
src/components/editor/**            (whole new module)
src/lib/pdf/extract-pdf.ts
src/lib/supabase/editor-service.ts
src/lib/supabase/migration_v4_editor.sql
src/app/admin/books/[id]/editor/page.tsx   (new full-screen route)
```

## 2. Install deps
```
npm install
```
(Tiptap v2 packages + `pdfjs-dist` were added to `package.json`.)

## 3. Run the SQL migration
Run `src/lib/supabase/migration_v4_editor.sql` against your Supabase project
(SQL editor or CLI). It adds `book_pages`, `book_editor_meta`, `book_versions`,
mirroring the `role = 'admin'` RLS pattern your `schema.sql` already uses.

Also create a public Storage bucket named `book-editor-images` (used by
`uploadEditorImage` in `editor-service.ts`) if you don't already have one.

## 4. Wire up the entry point
The new editor lives at **`/admin/books/[id]/editor`** — a separate
full-screen route from your existing `/admin/books/[id]/edit` metadata form
(Module 3 requires full-screen, which doesn't fit inside the form page).

In `src/components/admin/book-form.tsx`, in edit mode:
- Remove the `ChapterEditor` import and its usage/ref.
- Remove `saveBookChapters` / `fetchBookChapters` calls tied to the old editor.
- Add a button that routes to `/admin/books/${bookId}/editor`, e.g.:
  ```tsx
  <Button onClick={() => router.push(`/admin/books/${bookId}/editor`)}>
    Open content editor
  </Button>
  ```

Once confirmed working, delete:
- `src/components/admin/chapter-editor.tsx`
- any now-unused chapter-saving code in `books-service.ts`

## 5. Reader cutover (not included in this package)
The Reader currently renders `Chapter.paragraphs` / `paragraphsHtml`. This
package stores content as ProseMirror JSON in `book_pages.published_content`
instead (Module 19: structured JSON, not HTML). The preview panel proves the
JSON→HTML path works (`@tiptap/html`'s `generateHTML`), but pointing the
actual Reader at `book_pages` instead of `book_chapters` is a follow-up step —
tell me when you want that and I'll wire it in.

## What's included
Modules 1–12, 14–21 (foundation, fullscreen layout, Tiptap, toolbar, PDF
import, page management, formatting, images, tables, autosave, word
analytics, search, outline, shortcuts, publishing, JSON storage, Supabase
schema) are functional. Module 13 (preview) works against the same Tiptap→HTML
path but doesn't yet import your actual Reader typography component — it's a
close visual approximation. Module 22/23 (deep responsive/a11y polish) and
Module 25 (animation polish) got baseline coverage, not an exhaustive pass.

## What to send me next
Paste back any TypeScript/build errors after `npm install && npm run build` —
I didn't run this against your live repo, so first-pass type mismatches
(e.g. exact `Book`/`Loading` prop names) are the most likely thing to fix.
