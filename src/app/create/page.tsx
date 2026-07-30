"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/home/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

function CreatePageContent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("create.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("create.description")}</p>
      </div>

      <EmptyState
        icon={<UploadCloud className="h-5 w-5" aria-hidden="true" />}
        title={t("create.comingSoonTitle")}
        description={t("create.comingSoonDescription")}
        action={
          <Link href="/">
            <Button variant="outline" size="sm">
              {t("create.backHome")}
            </Button>
          </Link>
        }
      />
    </div>
  );
}

/**
 * Reserved for the Admin/upload module's PDF/DOCX → extracted-text pipeline
 * (see PRD "Reader" pipeline). Gated to the admin role now so the Sidebar's
 * "Create" entry has somewhere real to go without building that module here.
 */
export default function CreatePage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CreatePageContent />
    </ProtectedRoute>
  );
}
