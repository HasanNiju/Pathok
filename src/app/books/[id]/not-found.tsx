"use client";

import Link from "next/link";
import { BookX } from "lucide-react";
import { EmptyState } from "@/components/home/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

export default function BookNotFound() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-16">
      <EmptyState
        icon={<BookX className="h-5 w-5" aria-hidden="true" />}
        title={t("bookDetails.notFound.title")}
        description={t("bookDetails.notFound.description")}
        action={
          <Link href="/">
            <Button variant="outline" size="sm">
              {t("bookDetails.notFound.backHome")}
            </Button>
          </Link>
        }
      />
    </div>
  );
}
