import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book } from "@/types/book";
import type { Chapter } from "@/types/reader";
import type { BookMetadata } from "@/types/book-details";

interface BookRow {
  id: string;
  title: string;
  alt_title: string | null;
  author: string;
  translator: string | null;
  publisher: string | null;
  cover_url: string | null;
  category_slug: string | null;
  tags: string[] | null;
  description: string | null;
  rating: number;
  read_count: number;
  published_at: string | null;
  added_at: string;
  reading_minutes: number;
  trending_rank: number | null;
  is_recommended: boolean;
  status: "draft" | "published";
  file_url: string | null;
  file_type: "pdf" | "docx" | null;
  content_ready: boolean;
  deleted_at: string | null;
}

export function bookFromRow(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    altTitle: row.alt_title ?? undefined,
    author: row.author,
    translator: row.translator ?? undefined,
    publisher: row.publisher ?? undefined,
    coverUrl: row.cover_url ?? "/covers/placeholder.svg",
    categorySlug: row.category_slug ?? "",
    tags: row.tags ?? [],
    description: row.description ?? "",
    rating: Number(row.rating) || 0,
    readCount: row.read_count,
    publishedAt: row.published_at ?? row.added_at,
    addedAt: row.added_at,
    readingMinutes: row.reading_minutes,
    trendingRank: row.trending_rank ?? undefined,
    isRecommended: row.is_recommended,
    status: row.status,
    fileUrl: row.file_url ?? undefined,
    fileType: row.file_type ?? undefined,
    contentReady: row.content_ready,
    deletedAt: row.deleted_at,
  };
}

const BOOK_COLUMNS =
  "id,title,alt_title,author,translator,publisher,cover_url,category_slug,tags,description,rating,read_count,published_at,added_at,reading_minutes,trending_rank,is_recommended,status,file_url,file_type,content_ready,deleted_at";

/** Every published, non-deleted book — the public catalog (Home/Search/Dashboard/Related). */
export async function fetchPublishedBooks(supabase: SupabaseClient): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("status", "published")
    .is("deleted_at", null);
  if (error) throw error;
  return (data as BookRow[]).map(bookFromRow);
}

export async function fetchBookById(supabase: SupabaseClient, id: string): Promise<Book | null> {
  const { data, error } = await supabase.from("books").select(BOOK_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? bookFromRow(data as BookRow) : null;
}

export interface AdminBookListParams {
  search?: string;
  status?: "draft" | "published" | "all";
  categorySlug?: string;
  sort?: "newest" | "oldest" | "title-asc" | "title-desc";
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface AdminBookListResult {
  books: Book[];
  total: number;
}

/** Paginated/filterable/sortable book list for the admin Book Management screen. */
export async function fetchBooksAdmin(
  supabase: SupabaseClient,
  params: AdminBookListParams
): Promise<AdminBookListResult> {
  const { search, status = "all", categorySlug, sort = "newest", page = 1, pageSize = 10, includeDeleted = false } =
    params;

  let query = supabase.from("books").select(BOOK_COLUMNS, { count: "exact" });

  if (!includeDeleted) query = query.is("deleted_at", null);
  else query = query.not("deleted_at", "is", null);

  if (status !== "all") query = query.eq("status", status);
  if (categorySlug) query = query.eq("category_slug", categorySlug);
  if (search?.trim()) {
    const term = search.trim();
    query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%`);
  }

  switch (sort) {
    case "oldest":
      query = query.order("added_at", { ascending: true });
      break;
    case "title-asc":
      query = query.order("title", { ascending: true });
      break;
    case "title-desc":
      query = query.order("title", { ascending: false });
      break;
    default:
      query = query.order("added_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { books: (data as BookRow[]).map(bookFromRow), total: count ?? 0 };
}

export interface BookFormInput {
  id?: string;
  title: string;
  altTitle?: string;
  author: string;
  translator?: string;
  publisher?: string;
  categorySlug: string;
  tags: string[];
  description: string;
  status: "draft" | "published";
  coverUrl?: string;
  language?: "en" | "bn";
  isbn?: string;
}

function slugifyId(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") + `-${Date.now().toString(36)}`
  );
}

/** Creates a new book record (draft, no content yet) — step 1 of the upload workflow. */
export async function createBookRow(supabase: SupabaseClient, input: BookFormInput, userId: string): Promise<Book> {
  const id = input.id ?? slugifyId(input.title);
  const { error } = await supabase.from("books").insert({
    id,
    title: input.title,
    alt_title: input.altTitle || null,
    author: input.author,
    translator: input.translator || null,
    publisher: input.publisher || null,
    category_slug: input.categorySlug || null,
    tags: input.tags,
    description: input.description,
    cover_url: input.coverUrl || null,
    status: input.status,
    added_at: new Date().toISOString().slice(0, 10),
    published_at: input.status === "published" ? new Date().toISOString().slice(0, 10) : null,
    created_by: userId,
  });
  if (error) throw error;

  await supabase.from("book_metadata").upsert({
    book_id: id,
    publisher: input.publisher || null,
    language: input.language ?? "en",
    isbn: input.isbn || null,
    pages: null,
  });

  const book = await fetchBookById(supabase, id);
  if (!book) throw new Error("Book was created but could not be re-fetched.");
  return book;
}

export async function updateBookRow(supabase: SupabaseClient, id: string, input: Partial<BookFormInput>): Promise<Book> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.altTitle !== undefined) patch.alt_title = input.altTitle || null;
  if (input.author !== undefined) patch.author = input.author;
  if (input.translator !== undefined) patch.translator = input.translator || null;
  if (input.publisher !== undefined) patch.publisher = input.publisher || null;
  if (input.categorySlug !== undefined) patch.category_slug = input.categorySlug || null;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.description !== undefined) patch.description = input.description;
  if (input.coverUrl !== undefined) patch.cover_url = input.coverUrl;
  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status === "published") patch.published_at = new Date().toISOString().slice(0, 10);
  }

  const { error } = await supabase.from("books").update(patch).eq("id", id);
  if (error) throw error;

  if (input.language || input.isbn || input.publisher) {
    await supabase
      .from("book_metadata")
      .upsert({ book_id: id, language: input.language, isbn: input.isbn, publisher: input.publisher });
  }

  const book = await fetchBookById(supabase, id);
  if (!book) throw new Error("Book not found after update.");
  return book;
}

export async function softDeleteBook(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("books").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function restoreBook(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("books").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
}

/** Replaces a book's chapters with what's currently in the chapter editor, and marks content ready. */
export async function saveBookChapters(supabase: SupabaseClient, bookId: string, chapters: Chapter[]) {
  await supabase.from("book_chapters").delete().eq("book_id", bookId);
  if (chapters.length > 0) {
    const { error } = await supabase.from("book_chapters").insert(
      chapters.map((chapter) => ({
        id: chapter.id,
        book_id: bookId,
        order: chapter.order,
        title: chapter.title,
        paragraphs: chapter.paragraphs,
        paragraphs_html: chapter.paragraphsHtml ?? null,
      }))
    );
    if (error) throw error;
  }
  const readingMinutes = Math.max(
    1,
    Math.round(chapters.reduce((sum, c) => sum + c.paragraphs.join(" ").split(/\s+/).length, 0) / 220)
  );
  await supabase.from("books").update({ content_ready: true, reading_minutes: readingMinutes }).eq("id", bookId);
}

export async function fetchBookChapters(supabase: SupabaseClient, bookId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from("book_chapters")
    .select("id,book_id,order,title,paragraphs,paragraphs_html")
    .eq("book_id", bookId)
    .order("order");
  if (error) throw error;
  return (
    data as { id: string; book_id: string; order: number; title: string; paragraphs: string[]; paragraphs_html: string[] | null }[]
  ).map((row) => ({
    id: row.id,
    bookId: row.book_id,
    order: row.order,
    title: row.title,
    paragraphs: row.paragraphs,
    paragraphsHtml: row.paragraphs_html ?? undefined,
  }));
}

export async function fetchBookMetadata(supabase: SupabaseClient, bookId: string): Promise<BookMetadata | undefined> {
  const { data, error } = await supabase
    .from("book_metadata")
    .select("book_id,publisher,language,isbn,pages")
    .eq("book_id", bookId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return {
    bookId: data.book_id,
    publisher: data.publisher ?? "",
    language: (data.language ?? "en") as "en" | "bn",
    isbn: data.isbn ?? "",
    pages: data.pages ?? 0,
  };
}

export async function uploadBookCover(supabase: SupabaseClient, bookId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${bookId}/cover-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("book-covers").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
}


