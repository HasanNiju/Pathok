"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import { isValidName } from "@/lib/validation";
import { CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon } from "@/lib/categories";
import type { Category } from "@/types/book";
import type { CategoryInput } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Present in edit mode; null/undefined creates a new category. */
  category?: Category | null;
  onSubmit: (input: CategoryInput) => void;
}

interface FormErrors {
  name?: string;
  nameBn?: string;
  description?: string;
}

/**
 * Create/Edit modal for Category Management. The slug is always derived
 * from the English name (see useCategories) — categories are never
 * manually keyed by an admin, only labeled.
 */
export function CategoryFormModal({ open, onClose, category, onSubmit }: CategoryFormModalProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(category);

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>(DEFAULT_CATEGORY_ICON);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset the form to the target category (or blank) every time it opens.
  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setNameBn(category?.nameBn ?? "");
    setDescription(category?.description ?? "");
    setIcon(category?.icon ?? DEFAULT_CATEGORY_ICON);
    setErrors({});
  }, [open, category]);

  const handleSubmit = () => {
    const nextErrors: FormErrors = {};
    if (!isValidName(name)) nextErrors.name = t("admin.categories.form.errors.name");
    if (!nameBn.trim()) nextErrors.nameBn = t("admin.categories.form.errors.nameBn");
    if (!description.trim()) nextErrors.description = t("admin.categories.form.errors.description");

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({ name: name.trim(), nameBn: nameBn.trim(), description: description.trim(), icon });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("admin.categories.form.editTitle") : t("admin.categories.form.createTitle")}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {isEdit ? t("admin.categories.form.save") : t("admin.categories.form.create")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label={t("admin.categories.form.name")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          placeholder={t("admin.categories.form.namePlaceholder")}
        />
        <Input
          label={t("admin.categories.form.nameBn")}
          value={nameBn}
          onChange={(event) => setNameBn(event.target.value)}
          error={errors.nameBn}
          placeholder={t("admin.categories.form.nameBnPlaceholder")}
        />
        <Textarea
          label={t("admin.categories.form.description")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={errors.description}
          placeholder={t("admin.categories.form.descriptionPlaceholder")}
          rows={3}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{t("admin.categories.form.icon")}</span>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {CATEGORY_ICON_OPTIONS.map((option) => {
              const Icon = resolveCategoryIcon(option);
              const selected = icon === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIcon(option)}
                  aria-pressed={selected}
                  aria-label={option}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-200",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-foreground hover:border-primary/40"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
