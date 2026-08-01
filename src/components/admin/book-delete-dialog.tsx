"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import type { Book } from "@/types/book";

interface BookDeleteDialogProps {
  /** null closes the dialog. */
  book: Book | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Soft-delete only — the book is hidden from readers immediately but can
 *  be restored later from the "Show deleted" filter, per the PRD. */
export function BookDeleteDialog({ book, onClose, onConfirm }: BookDeleteDialogProps) {
  const { t } = useTranslation();

  if (!book) return null;

  return (
    <Modal open={Boolean(book)} onClose={onClose} title={t("admin.books.confirmDelete.title")}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-foreground">{t("admin.books.confirmDelete.description")}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            {t("admin.books.confirmDelete.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
