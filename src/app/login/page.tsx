"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { AuthShell, PasswordInput } from "@/components/auth";
import { Input, Button, Checkbox } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { isValidEmail } from "@/lib/validation";
import { resolveAuthErrorKey } from "@/lib/auth-errors";
import { AuthError } from "@/types/auth";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, requestOtp } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!isValidEmail(form.email)) next.email = t("auth.validation.emailInvalid");
    if (!form.password) next.password = t("auth.validation.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const authUser = await login(form);
      addToast({ title: t("auth.toasts.welcomeBack"), variant: "success" });
      router.push(authUser.role === "admin" || authUser.role === "super_admin" ? "/admin" : "/account");
    } catch (error) {
      if (error instanceof AuthError && error.code === "email_not_verified") {
        await requestOtp(form.email, "signup");
        addToast({
          title: t("auth.errors.emailNotVerified"),
          description: "We emailed you a verification code.",
          variant: "warning",
        });
        router.push(`/otp?purpose=signup&email=${encodeURIComponent(form.email)}`);
        return;
      }
      setFormError(t(resolveAuthErrorKey(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={t("auth.login.title")}
      description={t("auth.login.description")}
      footer={
        <>
          {t("auth.login.noAccount")}{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {t("auth.login.signupLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t("auth.login.emailLabel")}
          placeholder={t("auth.login.emailPlaceholder")}
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
        />

        <PasswordInput
          label={t("auth.login.passwordLabel")}
          placeholder={t("auth.login.passwordPlaceholder")}
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label={t("auth.login.rememberMe")}
            checked={form.rememberMe}
            onChange={(e) => setForm((f) => ({ ...f, rememberMe: e.target.checked }))}
          />
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {t("auth.login.forgotPassword")}
          </Link>
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
          {t("auth.login.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
