"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

export interface LoadingProps {
  size?: keyof typeof SIZE_CLASSES;
  label?: string;
  className?: string;
}

/** Inline spinner paired with a label — defaults to the translated "Loading" string. */
export function Loading({ size = "md", label, className }: LoadingProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}>
      <Loader2 className={cn("animate-spin", SIZE_CLASSES[size])} aria-hidden="true" />
      <span className="text-sm">{label ?? t("common.loading")}</span>
    </div>
  );
}
