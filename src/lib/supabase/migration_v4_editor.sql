-- Pathok Editor v2 — structured-JSON page storage.
-- Run after migration_v3_formatted_pdf.sql.

create table if not exists book_pages (
  id text primary key,
  book_id uuid not null references books(id) on delete cascade,
  "order" int not null,
  title text not null default '',
  draft_content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  published_content jsonb,
  status text not null default 'draft' check (status in ('empty','draft','ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists book_pages_book_id_order_idx on book_pages (book_id, "order");

-- One row per book, tracks v2 editor status independent of the legacy
-- chapter-based `books.status` field until the Reader is cut over.
create table if not exists book_editor_meta (
  book_id uuid primary key references books(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  subtitle text,
  edition text,
  language text not null default 'bn' check (language in ('bn','en')),
  last_saved_at timestamptz
);

-- Lightweight version history for autosave — keeps the last N snapshots per
-- book so a bad edit can be rolled back. Pruning is the app's job, not a trigger.
create table if not exists book_versions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists book_versions_book_id_created_idx on book_versions (book_id, created_at desc);

alter table book_pages enable row level security;
alter table book_editor_meta enable row level security;
alter table book_versions enable row level security;

-- Matches the existing "Admins manage books" / "Admins manage chapters"
-- pattern in schema.sql — role lives on `profiles`, not a helper function.
create policy "Admins manage book_pages" on book_pages for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins manage book_editor_meta" on book_editor_meta for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins manage book_versions" on book_versions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone reads published pages" on book_pages for select using (
  status = 'ready' or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
