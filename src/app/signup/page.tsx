"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import { AuthShell, PasswordInput, PasswordStrengthMeter } from "@/components/auth";
import { Input, Button } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/validation";
import { resolveAuthErrorKey } from "@/lib/auth-errors";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function SignupPage() {
  const { t } = useTranslation();
  const { signup, requestOtp } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!isValidName(form.name)) next.name = t("auth.validation.nameRequired");
    if (!isValidEmail(form.email)) next.email = t("auth.validation.emailInvalid");
    if (!isValidPassword(form.password)) next.password = t("auth.validation.passwordWeak");
    if (form.confirmPassword !== form.password) next.confirmPassword = t("auth.validation.passwordMismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      const otp = await requestOtp(form.email, "signup");
      addToast({
        title: t("auth.toasts.signupSuccess"),
        description: `Demo code: ${otp}`,
        variant: "success",
      });
      router.push(`/otp?purpose=signup&email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      setFormError(t(resolveAuthErrorKey(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={t("auth.signup.title")}
      description={t("auth.signup.description")}
      footer={
        <>
          {t("auth.signup.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("auth.signup.loginLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t("auth.signup.nameLabel")}
          placeholder={t("auth.signup.namePlaceholder")}
          autoComplete="name"
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        <Input
          label={t("auth.signup.emailLabel")}
          placeholder={t("auth.signup.emailPlaceholder")}
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            label={t("auth.signup.passwordLabel")}
            placeholder={t("auth.signup.passwordPlaceholder")}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <PasswordInput
          label={t("auth.signup.confirmPasswordLabel")}
          placeholder={t("auth.signup.confirmPasswordPlaceholder")}
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          error={errors.confirmPassword}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
          {t("auth.signup.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
