"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/ui/category-select";
import { BackButton } from "@/components/ui/back-button";
import { SectionHeader } from "@/components/home/section-header";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  createBookRow,
  updateBookRow,
  uploadBookCover,
  uploadBookFile,
  setBookFileMeta,
  saveBookChapters,
  fetchBookById,
  fetchBookMetadata,
  fetchBookChapters,
} from "@/lib/supabase/books-service";
import type { Book } from "@/types/book";
import type { Chapter } from "@/types/reader";

interface BookFormProps {
  mode: "create" | "edit";
  bookId?: string;
}

interface FormState {
  title: string;
  altTitle: string;
  author: string;
  translator: string;
  publisher: string;
  categorySlug: string;
  tags: string;
  description: string;
  language: "en" | "bn";
  isbn: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  altTitle: "",
  author: "",
  translator: "",
  publisher: "",
  categorySlug: "",
  tags: "",
  description: "",
  language: "en",
  isbn: "",
};

/**
 * Book Creation + Edit (Module 01). One form drives both: create starts
 * from EMPTY_FORM and saves a new draft on first "Save"; edit loads the
 * existing book/metadata/chapters first. The upload → extract → preview →
 * publish pipeline only unlocks once the book record itself exists (a
 * draft id is required before a file can be attached to it).
 */
export function BookForm({ mode, bookId }: BookFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [savedBook, setSavedBook] = useState<Book | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);

  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const update = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));

  // Edit mode: hydrate the form + existing chapters from Supabase.
  useEffect(() => {
    if (mode !== "edit" || !bookId) return;
    const supabase = createClient();
    Promise.all([fetchBookById(supabase, bookId), fetchBookMetadata(supabase, bookId), fetchBookChapters(supabase, bookId)]).then(
      ([book, metadata, existingChapters]) => {
        if (!book) {
          addToast({ title: t("common.error"), variant: "error" });
          router.push("/admin/books");
          return;
        }
        setSavedBook(book);
        setForm({
          title: book.title,
          altTitle: book.altTitle ?? "",
          author: book.author,
          translator: book.translator ?? "",
          publisher: book.publisher ?? "",
          categorySlug: book.categorySlug,
          tags: book.tags.join(", "),
          description: book.description,
          language: metadata?.language ?? "en",
          isbn: metadata?.isbn ?? "",
        });
        setCoverPreview(book.coverUrl || null);
        if (existingChapters.length > 0) setChapters(existingChapters);
        setIsLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, bookId]);

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const isMetaValid = form.title.trim().length >= 2 && form.author.trim().length >= 2 && Boolean(form.categorySlug);

  /** Creates the draft (first save) or updates metadata (every save after). */
  const handleSaveMeta = async () => {
    if (!isMetaValid) {
      addToast({ title: t("create.form.errors.required"), variant: "error" });
      return;
    }
    if (!user) return;

    setIsSavingMeta(true);
    try {
      const supabase = createClient();
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      let book = savedBook;
      let coverUrl = book?.coverUrl;

      if (!book) {
        book = await createBookRow(
          supabase,
          { title: form.title, altTitle: form.altTitle, author: form.author, translator: form.translator, publisher: form.publisher, categorySlug: form.categorySlug, tags, description: form.description, status: "draft", language: form.language, isbn: form.isbn },
          user.id
        );
      }

      if (coverFile) {
        coverUrl = await uploadBookCover(supabase, book.id, coverFile);
      }

      const updated = await updateBookRow(supabase, book.id, {
        title: form.title,
        altTitle: form.altTitle,
        author: form.author,
        translator: form.translator,
        publisher: form.publisher,
        categorySlug: form.categorySlug,
        tags,
        description: form.description,
        coverUrl,
        language: form.language,
        isbn: form.isbn,
      });

      setSavedBook(updated);
      setCoverFile(null);
      addToast({ title: t("create.form.toast.saved"), variant: "success" });

      if (mode === "create") router.replace(`/admin/books/${updated.id}/edit`);
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setIsSavingMeta(false);
    }
  };

  /** Upload → Store, per the PRD pipeline. Requires the draft to already
   *  exist. PDFs are never text-extracted — they're uploaded and served
   *  exactly as authored by the native PDF reader. DOCX still goes
   *  through extraction, since there's no "view as-is" equivalent for it. */
  const handleExtract = async () => {
    if (!savedBook || !sourceFile) return;

    const isPdf = sourceFile.name.toLowerCase().endsWith(".pdf");

    setIsExtracting(true);
    try {
      const supabase = createClient();
      const fileUrl = await uploadBookFile(supabase, savedBook.id, sourceFile);

      if (isPdf) {
        await setBookFileMeta(supabase, savedBook.id, { fileUrl, fileType: "pdf", contentReady: true });
        setSavedBook((current) => (current ? { ...current, fileUrl, fileType: "pdf", contentReady: true } : current));
        setChapters(null);
        setSourceFile(null);
        addToast({ title: t("create.form.toast.pdfReady"), variant: "success" });
        return;
      }

      const formData = new FormData();
      formData.append("file", sourceFile);
      formData.append("bookId", savedBook.id);

      const response = await fetch("/api/books/extract", { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        addToast({ title: result.error ?? t("common.error"), variant: "error" });
        return;
      }

      await setBookFileMeta(supabase, savedBook.id, { fileUrl, fileType: "docx", contentReady: false });
      await saveBookChapters(supabase, savedBook.id, result.chapters);
      setSavedBook((current) => (current ? { ...current, fileUrl, fileType: "docx", contentReady: true } : current));
      setChapters(result.chapters);
      setSourceFile(null);
      addToast({ title: t("create.form.toast.extracted"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setIsExtracting(false);
    }

  };

  const handlePublish = async () => {
    if (!savedBook) return;
    setIsPublishing(true);
    try {
      await updateBookRow(createClient(), savedBook.id, { status: "published" });
      addToast({ title: t("create.form.toast.published"), variant: "success" });
      router.push("/admin/books");
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-16">
      <BackButton href="/admin/books" label={t("admin.nav.books")} />

      <SectionHeader
        title={mode === "create" ? t("create.title") : t("create.editTitle")}
        subtitle={t("create.description")}
      />

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("create.form.sectionInfo")}</h2>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {coverPreview ? (
                <Image src={coverPreview} alt="" fill className="object-cover" sizes="112px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <UploadCloud className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
            </div>
            <label className="cursor-pointer text-xs font-medium text-primary hover:underline">
              {t("create.form.coverUpload")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t("create.form.title")} value={form.title} onChange={(e) => update({ title: e.target.value })} />
            <Input
              label={`${t("create.form.altTitle")} (${t("common.optional")})`}
              value={form.altTitle}
              onChange={(e) => update({ altTitle: e.target.value })}
            />
            <Input label={t("create.form.author")} value={form.author} onChange={(e) => update({ author: e.target.value })} />
            <Input
              label={`${t("create.form.translator")} (${t("common.optional")})`}
              value={form.translator}
              onChange={(e) => update({ translator: e.target.value })}
            />
            <Input
              label={`${t("create.form.publisher")} (${t("common.optional")})`}
              value={form.publisher}
              onChange={(e) => update({ publisher: e.target.value })}
            />
            <CategorySelect
              label={t("create.form.category")}
              value={form.categorySlug}
              onChange={(e) => update({ categorySlug: e.target.value })}
            />
          </div>
        </div>

        <Input
          label={`${t("create.form.tags")} (${t("common.optional")})`}
          placeholder={t("create.form.tagsPlaceholder")}
          value={form.tags}
          onChange={(e) => update({ tags: e.target.value })}
        />

        <Textarea
          label={t("create.form.description")}
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />

        <div className="flex justify-end">
          <Button onClick={handleSaveMeta} isLoading={isSavingMeta} disabled={!isMetaValid}>
            {savedBook ? t("common.save") : t("create.form.saveDraft")}
          </Button>
        </div>
      </Card>

      <Card className={`flex flex-col gap-4 p-5 ${!savedBook ? "opacity-50" : ""}`}>
        <h2 className="text-sm font-bold text-foreground">{t("create.form.sectionContent")}</h2>
        <p className="text-sm text-muted-foreground">
          {savedBook ? t("create.form.contentHint") : t("create.form.contentLocked")}
        </p>

        <label
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center ${
            savedBook ? "cursor-pointer hover:bg-secondary/50" : "pointer-events-none"
          }`}
        >
          <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">
            {sourceFile ? sourceFile.name : t("create.form.dropFile")}
          </span>
          <span className="text-xs text-muted-foreground">{t("create.form.fileTypes")}</span>
          <input
            type="file"
            accept=".pdf,.docx"
            disabled={!savedBook}
            className="hidden"
            onChange={(e) => setSourceFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex justify-end">
          <Button onClick={handleExtract} isLoading={isExtracting} disabled={!savedBook || !sourceFile}>
            {t("create.form.extract")}
          </Button>
        </div>

        {savedBook?.fileType === "pdf" && savedBook.contentReady && (
          <div className="flex items-center gap-2 rounded-lg bg-secondary/60 p-4 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("create.form.pdfReadyLabel")}
          </div>
        )}

        {chapters && chapters.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("create.form.previewTitle").replace("{count}", String(chapters.length))}
            </div>
            <ol className="flex max-h-48 flex-col gap-1 overflow-y-auto text-sm text-muted-foreground">
              {chapters.map((chapter) => (
                <li key={chapter.id} className="truncate">
                  {chapter.order}. {chapter.title} — {chapter.paragraphs.length} ¶
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handlePublish}
          isLoading={isPublishing}
          disabled={!savedBook || !savedBook.contentReady || savedBook.status === "published"}
        >
          {savedBook?.status === "published" ? t("admin.books.status.published") : t("create.form.publish")}
        </Button>
      </div>
    </div>
  );
}
