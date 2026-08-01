"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, BookOpen, Plus, Eye, EyeOff, Trash2, RotateCcw } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { BackButton } from "@/components/ui/back-button";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useAdminBooks } from "@/hooks/use-admin-books";
import { BookDeleteDialog } from "@/components/admin/book-delete-dialog";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/book";

/** Book Management (Module 01). Full CRUD is split across this list view
 *  (search/filter/sort/pagination/status/soft-delete/restore) and the
 *  shared BookForm (create at /create, edit at /admin/books/[id]/edit). */
export function AdminBooksView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const admin = useAdminBooks();
  const [deleting, setDeleting] = useState<Book | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await admin.remove(deleting.id);
      addToast({ title: t("admin.books.toast.deleted"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (book: Book) => {
    try {
      await admin.restore(book.id);
      addToast({ title: t("admin.books.toast.restored"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  const handleTogglePublish = async (book: Book) => {
    try {
      if (book.status === "published") {
        await admin.unpublish(book.id);
        addToast({ title: t("admin.books.toast.unpublished") });
      } else {
        await admin.publish(book.id);
        addToast({ title: t("admin.books.toast.published"), variant: "success" });
      }
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <BackButton href="/admin" label={t("admin.nav.dashboard")} />

      <SectionHeader
        title={t("admin.nav.books")}
        subtitle={t("admin.books.subtitle")}
        action={
          <Link href="/create">
            <Button size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("admin.books.new")}
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={admin.search}
          onChange={admin.setSearch}
          placeholder={t("admin.books.searchPlaceholder")}
          className="sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={admin.status}
            onChange={(e) => admin.setStatus(e.target.value as typeof admin.status)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="all">{t("admin.books.status.all")}</option>
            <option value="draft">{t("admin.books.status.draft")}</option>
            <option value="published">{t("admin.books.status.published")}</option>
          </select>

          <select
            value={admin.sort}
            onChange={(e) => admin.setSort(e.target.value as typeof admin.sort)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="newest">{t("admin.books.sort.newest")}</option>
            <option value="oldest">{t("admin.books.sort.oldest")}</option>
            <option value="title-asc">{t("admin.books.sort.titleAsc")}</option>
            <option value="title-desc">{t("admin.books.sort.titleDesc")}</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={admin.showDeleted}
              onChange={(e) => admin.setShowDeleted(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            {t("admin.books.showDeleted")}
          </label>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t("admin.books.summary").replace("{total}", String(admin.total))}</p>

      {admin.isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : admin.books.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title={t("admin.books.empty.title")}
          description={t("admin.books.empty.description")}
          action={
            <Link href="/create">
              <Button variant="outline" size="sm">
                {t("admin.books.new")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {admin.books.map((book) => (
            <Card key={book.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-secondary">
                {book.coverUrl && <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="44px" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-bold text-foreground">{book.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      book.status === "published" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {book.status === "published" ? t("admin.books.status.published") : t("admin.books.status.draft")}
                  </span>
                  {book.deletedAt && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      {t("admin.books.confirmDelete.confirm")}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{book.author}</p>
              </div>

              {book.deletedAt ? (
                <Button variant="outline" size="sm" onClick={() => handleRestore(book)}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {t("admin.books.actions.restore")}
                </Button>
              ) : (
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={t("common.moreActions")}>
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  }
                  items={[
                    {
                      label: t("admin.books.actions.edit"),
                      icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
                      onSelect: () => {
                        window.location.href = `/admin/books/${book.id}/edit`;
                      },
                    },
                    {
                      label: book.status === "published" ? t("admin.books.actions.unpublish") : t("admin.books.actions.publish"),
                      icon:
                        book.status === "published" ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        ),
                      onSelect: () => handleTogglePublish(book),
                    },
                    {
                      label: t("admin.books.actions.delete"),
                      icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                      destructive: true,
                      onSelect: () => setDeleting(book),
                    },
                  ]}
                />
              )}
            </Card>
          ))}
        </div>
      )}

      <Pagination currentPage={admin.page} totalPages={admin.totalPages} onPageChange={admin.setPage} />

      <BookDeleteDialog book={deleting} onClose={() => setDeleting(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
