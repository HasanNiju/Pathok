"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth";
import { Input, Button } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { isValidEmail } from "@/lib/validation";
import { resolveAuthErrorKey } from "@/lib/auth-errors";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!isValidEmail(email)) {
      setError(t("auth.validation.emailInvalid"));
      return;
    }
    setError(null);

    setIsSubmitting(true);
    try {
      const otp = await forgotPassword(email);
      addToast({ title: t("auth.toasts.otpSent"), description: `Demo code: ${otp}`, variant: "success" });
      router.push(`/otp?purpose=reset&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setFormError(t(resolveAuthErrorKey(err)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={t("auth.forgotPassword.title")}
      description={t("auth.forgotPassword.description")}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t("auth.forgotPassword.emailLabel")}
          placeholder={t("auth.forgotPassword.emailPlaceholder")}
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ?? undefined}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
          {t("auth.forgotPassword.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
