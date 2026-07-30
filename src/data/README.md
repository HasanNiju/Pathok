# /src/data

Dummy JSON data used in place of a real backend, per the project rule
"No backend. Use dummy JSON data."

- `books.json` / `books.ts` — the book catalog (Home module). `books.ts` is
  the only import surface components should use; it types the raw JSON and
  exposes the query helpers each rail is built from (latest, trending,
  popular, recommended, recently added, by category, search).
- `categories.json` / `categories.ts` — the browsable category list.
- `reading-progress.json` / `reading-progress.ts` — per-user progress,
  keyed by the demo account ids from the Auth module's mock database
  (`seed-admin`, `seed-user`). New signups have no entries here, so
  Continue Reading falls back to its empty state — this is expected, not
  a bug.

Future modules (Reader, Library detail pages, Admin upload) may extend
these files or add new ones; keep one JSON file + typed accessor module
per dataset rather than importing raw JSON directly from components.
