-- ============================================================
-- Pathok database schema
-- Paste this whole file into Supabase's SQL Editor and click "Run".
-- Safe to run once on a fresh project.
-- ============================================================

-- 1. PROFILES
-- Supabase Auth already stores email + password for you (in a table
-- called auth.users you don't need to touch). This table holds the
-- extra info your app needs: name, role (admin/user), avatar.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Automatically create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Reader'), 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CATEGORIES
create table categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  name_bn text not null,
  description text not null,
  icon text not null,
  active boolean not null default true
);

-- 3. BOOKS
create table books (
  id text primary key,
  title text not null,
  author text not null,
  cover_url text not null,
  category_slug text not null references categories(slug),
  description text not null,
  rating numeric(2,1) not null default 0,
  read_count integer not null default 0,
  published_at date not null,
  added_at date not null default now(),
  reading_minutes integer not null default 0,
  trending_rank integer,
  is_recommended boolean not null default false
);

-- 4. BOOK METADATA (publisher/ISBN/etc — one row per book)
create table book_metadata (
  book_id text primary key references books(id) on delete cascade,
  publisher text not null,
  language text not null default 'en' check (language in ('en', 'bn')),
  isbn text not null,
  pages integer not null
);

-- 5. BOOK CHAPTERS (the actual reading content)
create table book_chapters (
  id text primary key,
  book_id text not null references books(id) on delete cascade,
  "order" integer not null,
  title text not null,
  paragraphs jsonb not null default '[]',
  paragraphs_html jsonb
);

-- 6. REVIEWS (star rating + written review)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references books(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

-- 7. COMMENTS (discussion, no rating)
create table comments (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references books(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- 8. READING PROGRESS (per user, per book)
create table reading_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  book_id text not null references books(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  last_read_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- ============================================================
-- SECURITY (Row Level Security)
-- This controls who can read/write each table. Without this,
-- anyone with your public key could edit anything.
-- ============================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table books enable row level security;
alter table book_metadata enable row level security;
alter table book_chapters enable row level security;
alter table reviews enable row level security;
alter table comments enable row level security;
alter table reading_progress enable row level security;

-- Anyone (even logged out) can read books, categories, metadata,
-- chapters, reviews, and comments — this is a reading app, that
-- content is meant to be public.
create policy "Public read access" on categories for select using (true);
create policy "Public read access" on books for select using (true);
create policy "Public read access" on book_metadata for select using (true);
create policy "Public read access" on book_chapters for select using (true);
create policy "Public read access" on reviews for select using (true);
create policy "Public read access" on comments for select using (true);

-- Profiles: everyone can see basic profile info (needed to show
-- reviewer names), but you can only edit your own.
create policy "Public read access" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Reviews/comments: only logged-in users can create, and only the
-- author can edit or delete their own.
create policy "Logged-in users can post reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users manage own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users delete own reviews" on reviews for delete using (auth.uid() = user_id);

create policy "Logged-in users can post comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users manage own comments" on comments for update using (auth.uid() = user_id);
create policy "Users delete own comments" on comments for delete using (auth.uid() = user_id);

-- Reading progress is private — only you can see or change your own.
create policy "Users see own progress" on reading_progress for select using (auth.uid() = user_id);
create policy "Users insert own progress" on reading_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on reading_progress for update using (auth.uid() = user_id);

-- Admin-only writes for catalog content (books/categories/chapters).
-- Checks the requesting user's profile role = 'admin'.
create policy "Admins manage books" on books for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins manage chapters" on book_chapters for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins manage metadata" on book_metadata for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
