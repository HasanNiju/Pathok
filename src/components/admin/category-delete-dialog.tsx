"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import type { Category } from "@/types/book";

interface CategoryDeleteDialogProps {
  /** null closes the dialog. */
  category: Category | null;
  /** Number of books currently filed under this category. */
  bookCount: number;
  onClose: () => void;
  onConfirm: () => void;
  onDeactivateInstead: () => void;
}

/**
 * Confirms a category delete. A category still referenced by books can't
 * be hard-deleted (that would orphan their genre) — the dialog blocks the
 * delete action and offers Deactivate instead, which hides the category
 * from readers and the book picker without breaking existing books.
 */
export function CategoryDeleteDialog({
  category,
  bookCount,
  onClose,
  onConfirm,
  onDeactivateInstead,
}: CategoryDeleteDialogProps) {
  const { t, language } = useTranslation();

  if (!category) return null;

  const label = language === "bn" ? category.nameBn : category.name;
  const blocked = bookCount > 0;

  return (
    <Modal open={Boolean(category)} onClose={onClose} title={t("admin.categories.deleteDialog.title")}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-foreground">
            {blocked
              ? t("admin.categories.deleteDialog.blocked")
                  .replace("{name}", label)
                  .replace("{count}", String(bookCount))
              : t("admin.categories.deleteDialog.confirm").replace("{name}", label)}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          {blocked ? (
            <Button variant="outline" size="sm" onClick={onDeactivateInstead}>
              {t("admin.categories.deleteDialog.deactivateInstead")}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>
              {t("common.cancel")}
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={blocked}>
            {t("admin.categories.deleteDialog.delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
