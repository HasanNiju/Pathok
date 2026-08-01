"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Pencil, Power, PowerOff, Trash2, Plus, LayoutGrid } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { BackButton } from "@/components/ui/back-button";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useCategories, type CategoryInput } from "@/hooks/use-categories";
import { resolveCategoryIcon } from "@/lib/categories";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { CategoryDeleteDialog } from "@/components/admin/category-delete-dialog";
import type { Category } from "@/types/book";
import { cn } from "@/lib/utils";

/**
 * Category Management (Module 09). Full CRUD + activate/deactivate + search
 * over the category catalog, backed by useCategories (client-side,
 * localStorage-persisted — no backend per the PRD). This is the only place
 * categories are ever created or renamed; the (future) Book Creation module
 * picks from this list instead of a free-text field.
 */
export function AdminCategoriesView() {
  const { t, language } = useTranslation();
  const { addToast } = useToast();
  const { categories, createCategory, updateCategory, toggleActive, deleteCategory, getBookCount } =
    useCategories();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(normalized) ||
        category.nameBn.toLowerCase().includes(normalized) ||
        category.slug.toLowerCase().includes(normalized)
    );
  }, [categories, query]);

  const activeCount = categories.filter((category) => category.active).length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleSubmit = async (input: CategoryInput) => {
    try {
      if (editing) {
        await updateCategory(editing.id, input);
        addToast({ title: t("admin.categories.toast.updated"), variant: "success" });
      } else {
        await createCategory(input);
        addToast({ title: t("admin.categories.toast.created"), variant: "success" });
      }
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  const handleToggle = async (category: Category) => {
    try {
      await toggleActive(category.id);
      addToast({
        title: category.active
          ? t("admin.categories.toast.deactivated")
          : t("admin.categories.toast.activated"),
      });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCategory(deleting.id);
      addToast({ title: t("admin.categories.toast.deleted"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <BackButton href="/admin" label={t("admin.nav.dashboard")} />

      <SectionHeader
        title={t("admin.nav.categories")}
        subtitle={t("admin.categories.subtitle")}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("admin.categories.new")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t("admin.categories.searchPlaceholder")}
          className="sm:max-w-xs"
        />
        <p className="text-sm text-muted-foreground">
          {t("admin.categories.summary")
            .replace("{total}", String(categories.length))
            .replace("{active}", String(activeCount))}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-5 w-5" aria-hidden="true" />}
          title={t("admin.categories.empty.title")}
          description={t("admin.categories.empty.description")}
          action={
            <Button variant="outline" size="sm" onClick={openCreate}>
              {t("admin.categories.new")}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((category) => {
            const Icon = resolveCategoryIcon(category.icon);
            const label = language === "bn" ? category.nameBn : category.name;
            const bookCount = getBookCount(category.slug);

            return (
              <Card key={category.id} className="flex items-center gap-4 p-4">
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                    category.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-foreground">{label}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        category.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {category.active
                        ? t("admin.categories.status.active")
                        : t("admin.categories.status.inactive")}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{category.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("admin.categories.bookCount").replace("{count}", String(bookCount))}
                  </p>
                </div>

                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={t("common.moreActions")}>
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  }
                  items={[
                    {
                      label: t("admin.categories.actions.edit"),
                      icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
                      onSelect: () => openEdit(category),
                    },
                    {
                      label: category.active
                        ? t("admin.categories.actions.deactivate")
                        : t("admin.categories.actions.activate"),
                      icon: category.active ? (
                        <PowerOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Power className="h-4 w-4" aria-hidden="true" />
                      ),
                      onSelect: () => handleToggle(category),
                    },
                    {
                      label: t("admin.categories.actions.delete"),
                      icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                      destructive: true,
                      onSelect: () => setDeleting(category),
                    },
                  ]}
                />
              </Card>
            );
          })}
        </div>
      )}

      <CategoryFormModal open={formOpen} onClose={() => setFormOpen(false)} category={editing} onSubmit={handleSubmit} />

      <CategoryDeleteDialog
        category={deleting}
        bookCount={deleting ? getBookCount(deleting.slug) : 0}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        onDeactivateInstead={() => {
          if (deleting) handleToggle(deleting);
          setDeleting(null);
        }}
      />
    </div>
  );
}
