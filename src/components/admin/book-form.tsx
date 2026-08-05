"use client";

import { useEffect, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, CheckCircle2, PenSquare } from "lucide-react";
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
import { createBookRow, updateBookRow, uploadBookCover, fetchBookById, fetchBookMetadata } from "@/lib/supabase/books-service";
import { extractPdfToPages } from "@/lib/pdf/extract-pdf";
import { replaceAllPages } from "@/lib/supabase/editor-service";
import type { Book } from "@/types/book";

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
 * existing book/metadata/chapters first. The chapter editor only unlocks
 * once the book record itself exists (a draft id is required before
 * chapters can be attached to it).
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
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Book upload -> extract -> editor (Module 01 "upload a book" workflow).
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [pdfImportProgress, setPdfImportProgress] = useState<{ page: number; total: number } | null>(null);
  const [pdfImportError, setPdfImportError] = useState<string | null>(null);

  const update = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));

  // Edit mode: hydrate the form + existing chapters from Supabase.
  useEffect(() => {
    if (mode !== "edit" || !bookId) return;
    const supabase = createClient();
    Promise.all([fetchBookById(supabase, bookId), fetchBookMetadata(supabase, bookId)]).then(
      ([book, metadata]) => {
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

  /**
   * Upload a book file straight from the create/edit form: extract its
   * pages via pdfjs, push them to Supabase, then jump into the full-screen
   * content editor with the extracted content already loaded.
   */
  const handleUploadBook = async (file: File) => {
    if (!savedBook) return;
    if (file.type !== "application/pdf") {
      setPdfImportError(t("create.form.pdfImport.invalidType"));
      return;
    }
    setPdfImportError(null);
    setIsImportingPdf(true);
    setPdfImportProgress({ page: 0, total: 1 });

    let pages;
    try {
      pages = await extractPdfToPages(file, savedBook.id, (p) =>
        setPdfImportProgress({ page: p.page, total: p.totalPages })
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[BookForm] PDF extraction failed:", err);
      setPdfImportError(t("create.form.pdfImport.error"));
      setIsImportingPdf(false);
      setPdfImportProgress(null);
      return;
    }

    try {
      await replaceAllPages(savedBook.id, pages);
      addToast({ title: t("create.form.pdfImport.success"), variant: "success" });
      router.push(`/admin/books/${savedBook.id}/editor`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[BookForm] Saving extracted pages failed:", err);
      const detail = (err as { message?: string })?.message;
      setPdfImportError(
        detail ? `Extracted the PDF, but couldn't save it: ${detail}` : "Extracted the PDF, but couldn't save it."
      );
    } finally {
      setIsImportingPdf(false);
      setPdfImportProgress(null);
    }
  };

  const handleBookDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!savedBook || isImportingPdf) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUploadBook(file);
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-foreground">{t("create.form.sectionContent")}</h2>
            <p className="text-sm text-muted-foreground">
              {savedBook ? t("create.form.contentHint") : t("create.form.contentLocked")}
            </p>
          </div>
          {savedBook?.contentReady && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Content ready
            </div>
          )}
        </div>

        <label
          className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors ${
            !savedBook || isImportingPdf ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-secondary/40"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleBookDrop}
        >
          <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium">
            {isImportingPdf
              ? pdfImportProgress
                ? t("create.form.uploadExtracting")
                    .replace("{page}", String(pdfImportProgress.page))
                    .replace("{total}", String(pdfImportProgress.total))
                : t("common.loading")
              : t("create.form.uploadBook")}
          </span>
          <span className="text-xs text-muted-foreground">{t("create.form.uploadBookHint")}</span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={!savedBook || isImportingPdf}
            onChange={(e) => e.target.files?.[0] && void handleUploadBook(e.target.files[0])}
          />
        </label>

        {isImportingPdf && pdfImportProgress && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${pdfImportProgress.total ? (pdfImportProgress.page / pdfImportProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        )}

        {pdfImportError && <p className="text-xs text-destructive">{pdfImportError}</p>}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("create.form.orDivider")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => savedBook && router.push(`/admin/books/${savedBook.id}/editor`)}
            disabled={!savedBook}
          >
            <PenSquare className="h-4 w-4" aria-hidden="true" />
            {t("create.form.openEditor")}
          </Button>
        </div>
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
