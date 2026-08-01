"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SectionHeader } from "@/components/home/section-header";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useBranding } from "@/providers/branding-provider";
import { createClient } from "@/lib/supabase/client";
import { saveSetting, uploadBrandingAsset } from "@/lib/supabase/settings-service";
import type { BrandingSettings } from "@/types/admin";

/** Branding (Module 05). Reads/writes the same `branding` row the
 *  BrandingProvider applies globally, so saving here updates the whole
 *  app (accent color, site name, favicon) immediately for every visitor. */
export function AdminBrandingView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { branding, reload } = useBranding();

  const [form, setForm] = useState<BrandingSettings>(branding);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setForm(branding), [branding]);

  const handleAssetUpload = async (
    file: File,
    field: keyof Pick<BrandingSettings, "logoUrl" | "darkLogoUrl" | "faviconUrl">,
    slot: "logo" | "dark-logo" | "favicon"
  ) => {
    try {
      const url = await uploadBrandingAsset(createClient(), file, slot);
      setForm((current) => ({ ...current, [field]: url }));
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

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

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.branding.sectionAssets")}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {(
            [
              { key: "logoUrl", slot: "logo", label: t("admin.branding.logo") },
              { key: "darkLogoUrl", slot: "dark-logo", label: t("admin.branding.darkLogo") },
              { key: "faviconUrl", slot: "favicon", label: t("admin.branding.favicon") },
            ] as const
          ).map((asset) => (
            <div key={asset.key} className="flex flex-col items-center gap-2">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                {form[asset.key] ? (
                  <Image src={form[asset.key]} alt="" fill className="object-contain p-2" sizes="80px" />
                ) : (
                  <span className="text-xs text-muted-foreground">{asset.label}</span>
                )}
              </div>
              <label className="cursor-pointer text-xs font-medium text-primary hover:underline">
                {t("admin.branding.upload")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAssetUpload(file, asset.key, asset.slot);
                  }}
                />
              </label>
            </div>
          ))}
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

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.branding.sectionAppearance")}</h2>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.accentColor}
            onChange={(e) => setForm((c) => ({ ...c, accentColor: e.target.value }))}
            className="h-11 w-14 cursor-pointer rounded-md border border-input bg-background"
          />
          <span className="text-sm text-muted-foreground">{form.accentColor}</span>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          {t("admin.branding.save")}
        </Button>
      </div>
    </div>
  );
}
