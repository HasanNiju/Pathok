"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/home/section-header";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark, BrandWordmark } from "@/components/layout/brand-logo";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useBranding } from "@/providers/branding-provider";
import { createClient } from "@/lib/supabase/client";
import { saveSetting } from "@/lib/supabase/settings-service";
import type { BrandingSettings } from "@/types/admin";

/**
 * Branding (Module 05) — identity copy only.
 *
 * The logo, favicon, and brand color are locked Pathok brand assets and are
 * intentionally not editable here: they read from the fixed brand mark
 * (BrandMark / BrandWordmark) and design tokens (globals.css), never from
 * admin input. This page only lets admins update the site name and tagline
 * that appear in <title> and copy across the app.
 */
export function AdminBrandingView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { branding, reload } = useBranding();

  const [form, setForm] = useState<BrandingSettings>(branding);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setForm(branding), [branding]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSetting(createClient(), "branding", form);
      reload();
      addToast({ title: t("admin.branding.toast.saved"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <BackButton href="/admin" label={t("admin.nav.dashboard")} />
      <SectionHeader title={t("admin.nav.branding")} subtitle={t("admin.branding.subtitle")} />

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.branding.sectionAssets")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.branding.lockedNotice")}</p>
        <div className="flex flex-wrap items-center gap-8 rounded-lg border border-dashed border-border bg-secondary/40 p-5">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-background">
              <BrandMark size={40} />
            </div>
            <span className="text-xs text-muted-foreground">{t("admin.branding.logo")}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 items-center justify-center rounded-xl bg-background px-4">
              <BrandWordmark imageHeight={28} />
            </div>
            <span className="text-xs text-muted-foreground">{t("admin.branding.wordmark")}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="h-10 w-10 rounded-full border border-border" style={{ backgroundColor: "#FE0227" }} />
            <span className="text-xs text-muted-foreground">{t("admin.branding.brandColor")}</span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.branding.sectionIdentity")}</h2>
        <Input
          label={t("admin.branding.siteName")}
          value={form.siteName}
          onChange={(e) => setForm((c) => ({ ...c, siteName: e.target.value }))}
        />
        <Input
          label={t("admin.branding.tagline")}
          value={form.tagline}
          onChange={(e) => setForm((c) => ({ ...c, tagline: e.target.value }))}
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          {t("admin.branding.save")}
        </Button>
      </div>
    </div>
  );
}
