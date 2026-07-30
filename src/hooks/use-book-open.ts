"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

/**
 * Returns a stable click handler for book covers/cards across the Home
 * module. The Reader module (actual book detail + reading view) hasn't
 * been built yet, so this surfaces the same "not built yet" toast the rest
 * of the app already uses, instead of linking to a route that doesn't exist.
 */
export function useOpenBook() {
  const { t } = useTranslation();
  const { addToast } = useToast();

  return () => addToast({ title: t("shell.comingSoon") });
}
