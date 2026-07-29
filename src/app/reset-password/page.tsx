"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, PasswordInput, PasswordStrengthMeter } from "@/components/auth";
import { Button, Loading } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { isValidPassword } from "@/lib/validation";
import { resolveAuthErrorKey } from "@/lib/auth-errors";

function ResetPasswordContent() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!isValidPassword(password)) next.password = t("auth.validation.passwordWeak");
    if (confirmPassword !== password) next.confirmPassword = t("auth.validation.passwordMismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await resetPassword(email, password);
      addToast({ title: t("auth.toasts.passwordResetSuccess"), variant: "success" });
      router.push("/login");
    } catch (error) {
      setFormError(t(resolveAuthErrorKey(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title={t("auth.resetPassword.title")} description={t("auth.resetPassword.description")}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PasswordInput
            label={t("auth.resetPassword.newPasswordLabel")}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordInput
          label={t("auth.resetPassword.confirmPasswordLabel")}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
          {t("auth.resetPassword.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading size="lg" className="mx-auto mt-16" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
