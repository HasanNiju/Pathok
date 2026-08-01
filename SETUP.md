# Pathok — How to ship each update

You have **two completely separate systems** to update, and they don't talk to
each other automatically:

1. **Code** → lives in your GitHub repo → Vercel rebuilds automatically on push.
2. **Database** → lives in Supabase → you update it yourself, by hand, in the
   Supabase dashboard. `git push` never touches your database.

Below is exactly what to do, in order, whenever I hand you a new batch of files.

---

## 1. Updating code (the part you already know)

Nothing changes about your existing process:

1. Copy the new/changed files from the zip into your local Pathok folder,
   overwriting the same paths (e.g. `src/hooks/use-categories.ts` replaces the
   old one).
2. In VS Code: `git add -A`, `git commit -m "..."`, `git push`.
3. Vercel detects the push and redeploys automatically — no extra step there.

**One-time extra:** whenever a batch adds new npm packages (I'll always tell
you), Vercel will install them automatically during its build from
`package.json` — you don't need to do anything extra for Vercel. But if you
also run the app locally (`npm run dev`), run `npm install` locally once
after pulling those files, or your local dev server will error on the new
imports.

---

## 2. Updating the database (the part that's new to you)

Every batch that changes the database comes with one `.sql` file
(e.g. `src/lib/supabase/migration_v1_mvp.sql`). You run it **once, manually**,
directly in Supabase — it is not something git or Vercel touches.

Steps, every time:

1. Go to **supabase.com/dashboard** → open your **Pathok** project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open the `.sql` file I gave you (it'll be sitting in your local folder at
   the path shown, e.g. `src/lib/supabase/migration_v1_mvp.sql`) — copy its
   entire contents.
5. Paste into the SQL Editor, then click **Run** (or `Ctrl/Cmd + Enter`).
6. Check the output panel for errors. My migration files are written to be
   safe to run more than once (they use `if not exists` / `drop policy if
   exists` everywhere), so if you're ever unsure whether you already ran one,
   it's safe to just run it again.

That's it — no CLI, no terminal, no linking your project. Just paste-and-run
in the dashboard.

### The one Supabase setting you must also do by hand

Some upcoming features (User Management, Admin Management) need a
**service-role secret key** that must never be committed to GitHub. So it
goes into Vercel's environment variables, not into a file:

1. Supabase dashboard → **Project Settings → API**.
2. Copy the **`service_role`** secret (NOT the `anon`/`publishable` one).
3. Go to **Vercel dashboard → your Pathok project → Settings →
   Environment Variables**.
4. Add a new variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (paste the secret)
   - Environment: Production (and Preview if you want previews to work too)
5. Redeploy (Vercel → Deployments → ⋯ → Redeploy) so the new env var takes effect.

If you also run the app locally, add the same line to your local `.env.local`
file (never commit that file — it should already be in `.gitignore`).

### Storage buckets

The migration file also creates the storage buckets Pathok needs
(`book-covers`, `book-files`, `branding`) — running the SQL is enough, you
don't need to create these by hand in **Storage** unless the SQL errors out
for permission reasons, in which case just create the three buckets manually
there with the same names (Storage → New bucket).

---

## 3. Quick checklist for every future batch I hand you

- [ ] Copy files into your local folder, overwrite same paths
- [ ] If a new `.sql` file is included → paste + Run it in Supabase SQL Editor
- [ ] If new env vars are mentioned → add them in Vercel Settings → redeploy
- [ ] `git add -A && git commit -m "..." && git push`
- [ ] (optional, for local testing) `npm install` if package.json changed

## 4. What's in this batch (MVP completion)

This drop takes Pathok from "auth is real, everything else is dummy data" to
a fully working Supabase-backed MVP. Highlights:

- **Categories, Books, Reading Progress, Bookmarks, Favorites, Reviews,
  Comments** — all now read/write Supabase instead of localStorage/JSON.
- **Book Management** — full admin list (search/filter/sort/pagination/
  status/soft-delete/restore) + a create/edit form with a real PDF/DOCX
  upload → text-extraction → chapter preview → publish pipeline
  (`/api/books/extract`, using `pdf-parse`/`mammoth`).
- **User Management** (`/admin/users`) and **Admin Management**
  (`/admin/admins`, Super Admin only) — both backed by service-role API
  routes (`/api/admin/users/*`, `/api/admin/admins/*`) since these actions
  (suspend, delete, create admin, reset password) need Supabase Auth's
  admin API, not something the browser can do directly.
- **Branding** (`/admin/branding`) — logo/dark-logo/favicon upload, site
  name/tagline, accent color — applied live, site-wide, via a
  `BrandingProvider` every page already reads from instead of hardcoding
  "Pathok".
- **Global Settings** (`/admin/settings`) — default theme/language, reader
  defaults, upload constraints — stored in Supabase as an admin control
  panel.
- **Text-to-Speech** in the Reader (browser `SpeechSynthesis`, no external
  service) — play/pause/resume/stop, voice selector, speed control.
- **Recommendation engine** (`src/lib/recommendations.ts`) — rule-based,
  no AI: continue reading → same category → same author → recent
  searches → popular → newest. Powers Home, Book Details, and is easy to
  swap for an AI version later without touching call sites.
- **Global Search** — title/author/category matching + category filter,
  with search terms logged to `search_history` to feed the recommender.

### Run this once before testing

The migration file `src/lib/supabase/migration_v1_mvp.sql` covers
*everything above* in one file — categories, books, bookmarks, favorites,
search history, site settings, storage buckets, and the updated RLS
policies. Paste it into the Supabase SQL Editor and run it (see section 2
above) before testing any of this.

You'll also need to add `SUPABASE_SERVICE_ROLE_KEY` to Vercel's environment
variables (see section 2) for User Management / Admin Management to work —
those routes call Supabase Auth's admin API, which requires that key.

**Give yourself Super Admin access** once, directly in the SQL Editor:
```sql
update profiles set role = 'super_admin' where id = '<your-auth-user-uuid>';
```
(Find your UUID under Supabase → Authentication → Users.)

## 5. Native PDF reader (this batch)

Uploaded **PDFs** are no longer text-extracted — they're shown to readers
exactly as designed (original layout, images, fonts), two pages side by
side on desktop, one page at a time on mobile, sitting on a background
that matches the app's light/dark theme.

**DOCX uploads are unchanged** — they still go through text extraction into
the typography Reader, since there's no "view as-is" option for a Word
file the way there is for a PDF.

### Run this extra SQL once

A second migration file, `src/lib/supabase/migration_v2_pdf_native.sql`,
makes the file-storage bucket public (same as book covers already are) so
the PDF reader can load files directly. Paste it into the SQL Editor and
run it, same as before.

### Known trade-off

Because PDFs are shown as real pages now (not extracted text), a few
Reader features only work for DOCX-based books, not PDF ones: **Read
Aloud (TTS), in-book text search, and text highlighting/annotations**.
Position bookmarks and reading-progress percentage *do* still work for
PDFs. If you'd like Read Aloud to work for PDFs too, that's possible as a
follow-up (extracting text quietly in the background just for narration,
while still showing the PDF visually as-is) — just ask.

### Known simplifications (deliberately left out of this pass)

- The book-level "quick bookmark" toggle on the Book Details page (distinct
  from the Reader's in-book position bookmarks, which *are* Supabase-backed)
  still uses localStorage — it's a lightweight per-device convenience, not
  the core Bookmarks feature.
- Global Settings' reader defaults (font/size/width) are saved and
  displayed in the admin panel, but not yet wired to override a *new*
  reader's initial in-Reader settings — each reader still starts from the
  app's built-in defaults and customizes their own from there.
- PDF/DOCX chapter-splitting uses heading detection with a fixed-size
  fallback — it's a solid heuristic, not a guarantee of perfect chapter
  boundaries for every possible document layout.
- Vercel's default serverless function body-size limit (~4.5MB on the free
  tier) applies to the upload/extract route — very large PDFs may need a
  paid tier or a direct-to-storage upload approach later.

