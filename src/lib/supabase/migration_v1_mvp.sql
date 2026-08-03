-- ============================================================
-- Pathok — MVP completion migration
-- Paste into Supabase SQL Editor and run ONCE, after the base schema.sql.
-- Every statement is additive/idempotent-safe (checks existence first).
-- ============================================================

-- 1. PROFILES: roles + suspend/activate + admin bookkeeping
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('user', 'admin', 'super_admin'));
alter table profiles add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended'));
alter table profiles add column if not exists created_by uuid references profiles(id);

-- 2. CATEGORIES: activate/deactivate already exists (active). Nothing else needed.

-- 3. BOOKS: metadata + workflow fields the Book Management module needs
alter table books add column if not exists alt_title text;
alter table books add column if not exists translator text;
alter table books add column if not exists publisher text;
alter table books add column if not exists tags jsonb not null default '[]';
alter table books add column if not exists status text not null default 'draft'
  check (status in ('draft', 'published'));
alter table books add column if not exists file_url text;
alter table books add column if not exists file_type text check (file_type in ('pdf', 'docx'));
alter table books add column if not exists content_ready boolean not null default false;
alter table books add column if not exists deleted_at timestamptz;
alter table books add column if not exists created_by uuid references profiles(id);
alter table books add column if not exists updated_at timestamptz not null default now();
-- category is optional while a draft is being set up
alter table books alter column category_slug drop not null;
alter table books alter column cover_url drop not null;
alter table books alter column description drop not null;
alter table books alter column published_at drop not null;

-- 4. BOOK_METADATA: language must allow being unset while a draft has no file yet
alter table book_metadata alter column language drop not null;
alter table book_metadata alter column publisher drop not null;
alter table book_metadata alter column isbn drop not null;
alter table book_metadata alter column pages drop not null;

-- 5. BOOKMARKS (Reader "save my place" — distinct from favorites)
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  book_id text not null references books(id) on delete cascade,
  chapter_id text not null,
  page_index integer not null default 0,
  excerpt text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists bookmarks_user_book_idx on bookmarks(user_id, book_id);

-- 6. FAVORITES (moved out of localStorage)
create table if not exists favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  book_id text not null references books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- 7. SEARCH HISTORY (feeds the recommendation engine)
create table if not exists search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);
create index if not exists search_history_user_idx on search_history(user_id, created_at desc);

-- 8. SITE SETTINGS (branding + global settings — single-row key/value store)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into site_settings (key, value) values
  ('branding', '{"siteName":"Pathok","tagline":"Read beautifully."}'),
  ('general', '{"defaultTheme":"system","defaultLanguage":"en"}'),
  ('reader_defaults', '{"fontFamily":"serif","fontSize":18,"readingWidth":"comfortable"}'),
  ('upload', '{"allowedTypes":["pdf","docx"],"maxUploadSizeMb":25}')
on conflict (key) do nothing;

-- 9. READING_PROGRESS: needs chapter/page position, not just percent
alter table reading_progress add column if not exists chapter_id text;
alter table reading_progress add column if not exists page_index integer not null default 0;
alter table reading_progress add column if not exists minutes_spent integer not null default 0;

-- ============================================================
-- ROW LEVEL SECURITY for new tables
-- ============================================================
alter table bookmarks enable row level security;
alter table favorites enable row level security;
alter table search_history enable row level security;
alter table site_settings enable row level security;

drop policy if exists "Users manage own bookmarks" on bookmarks;
create policy "Users manage own bookmarks" on bookmarks for all using (auth.uid() = user_id);

drop policy if exists "Users manage own favorites" on favorites;
create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id);

drop policy if exists "Users manage own search history" on search_history;
create policy "Users manage own search history" on search_history for all using (auth.uid() = user_id or user_id is null);

drop policy if exists "Public read settings" on site_settings;
create policy "Public read settings" on site_settings for select using (true);
drop policy if exists "Admins manage settings" on site_settings;
create policy "Admins manage settings" on site_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- Books/categories/chapters/metadata: widen "admin" checks to include super_admin
drop policy if exists "Admins manage books" on books;
create policy "Admins manage books" on books for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
drop policy if exists "Admins manage categories" on categories;
create policy "Admins manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
drop policy if exists "Admins manage chapters" on book_chapters;
create policy "Admins manage chapters" on book_chapters for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
drop policy if exists "Admins manage metadata" on book_metadata;
create policy "Admins manage metadata" on book_metadata for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- Public book listing must only ever show published, non-deleted books to
-- non-admins; admins (via the service-role key in API routes) see everything.
drop policy if exists "Public read access" on books;
create policy "Public read published books" on books for select using (
  (status = 'published' and deleted_at is null)
  or exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- ============================================================
-- STORAGE BUCKETS
-- Run this section too — creates buckets used by cover/logo/file uploads.
-- (If a bucket already exists this will just error harmlessly on insert;
-- ignore "duplicate key" errors here.)
-- ============================================================
insert into storage.buckets (id, name, public) values ('book-covers', 'book-covers', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('book-files', 'book-files', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('branding', 'branding', true) on conflict (id) do nothing;

drop policy if exists "Public read book covers" on storage.objects;
create policy "Public read book covers" on storage.objects for select using (bucket_id = 'book-covers');
drop policy if exists "Public read branding" on storage.objects;
create policy "Public read branding" on storage.objects for select using (bucket_id = 'branding');

drop policy if exists "Admins write book covers" on storage.objects;
create policy "Admins write book covers" on storage.objects for all using (
  bucket_id = 'book-covers' and exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
drop policy if exists "Admins write branding" on storage.objects;
create policy "Admins write branding" on storage.objects for all using (
  bucket_id = 'branding' and exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
drop policy if exists "Admins manage book files" on storage.objects;
create policy "Admins manage book files" on storage.objects for all using (
  bucket_id = 'book-files' and exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- ============================================================
-- IMPORTANT: promote your own account to super_admin manually, e.g.:
--   update profiles set role = 'super_admin' where id = '<your-auth-user-uuid>';
-- ============================================================
