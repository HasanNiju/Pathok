"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth";
import { Button, Loading } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

function VerifyEmailContent() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <AuthShell title={t("auth.verifyEmail.title")} description={t("auth.verifyEmail.description")}>
      <div className="flex flex-col items-center gap-6">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>

        <Button size="lg" className="w-full" onClick={() => router.push("/login")}>
          {t("auth.verifyEmail.continueButton")}
        </Button>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading size="lg" className="mx-auto mt-16" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
