"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell, OtpInput } from "@/components/auth";
import { Button, Loading } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { isValidOtp } from "@/lib/validation";
import { resolveAuthErrorKey } from "@/lib/auth-errors";
import type { OtpPurpose } from "@/types/auth";

const RESEND_COOLDOWN_SECONDS = 30;

function OtpPageContent() {
  const { t } = useTranslation();
  const { verifyOtp, resendOtp } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const purpose = (searchParams.get("purpose") as OtpPurpose | null) ?? "signup";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify() {
    setError(null);
    if (!isValidOtp(code)) {
      setError(t("auth.validation.otpInvalid"));
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtp(email, purpose, code);
      if (purpose === "signup") {
        addToast({ title: t("auth.toasts.emailVerified"), variant: "success" });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(t(resolveAuthErrorKey(err)));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      await resendOtp(email, purpose);
      addToast({ title: t("auth.toasts.otpResent"), description: "Check your email for the new code.", variant: "success" });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCode("");
    } catch (err) {
      setError(t(resolveAuthErrorKey(err)));
    } finally {
      setIsResending(false);
    }
  }

  const description = t("auth.otp.description").replace("{email}", email || "—");

  return (
    <AuthShell
      title={t("auth.otp.title")}
      description={description}
      footer={
        <Link
          href={purpose === "signup" ? "/signup" : "/forgot-password"}
          className="font-medium text-primary hover:underline"
        >
          {t("auth.otp.changeEmail")}
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        <OtpInput value={code} onChange={setCode} disabled={isVerifying} error={!!error} />

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button onClick={handleVerify} size="lg" isLoading={isVerifying} className="w-full">
          {t("auth.otp.verify")}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-sm font-medium text-primary transition-colors duration-200 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? t("auth.otp.resendIn").replace("{seconds}", String(cooldown)) : t("auth.otp.resend")}
        </button>
      </div>
    </AuthShell>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<Loading size="lg" className="mx-auto mt-16" />}>
      <OtpPageContent />
    </Suspense>
  );
}
