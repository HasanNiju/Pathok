"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/home/section-header";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/use-site-settings";

const SELECT_CLASS = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground";

export function AdminSettingsView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const settings = useSiteSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settings.save();
      addToast({ title: t("admin.settings.toast.saved"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFileType = (type: "pdf" | "docx") => {
    settings.setUpload((current) => ({
      ...current,
      allowedTypes: current.allowedTypes.includes(type)
        ? current.allowedTypes.filter((t2) => t2 !== type)
        : [...current.allowedTypes, type],
    }));
  };

  if (settings.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <BackButton href="/admin" label={t("admin.nav.dashboard")} />
      <SectionHeader title={t("admin.nav.settings")} subtitle={t("admin.settings.subtitle")} />

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.settings.sectionGeneral")}</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("admin.settings.defaultTheme")}</label>
          <select
            className={SELECT_CLASS}
            value={settings.general.defaultTheme}
            onChange={(e) => settings.setGeneral((c) => ({ ...c, defaultTheme: e.target.value as typeof c.defaultTheme }))}
          >
            <option value="light">{t("admin.settings.theme.light")}</option>
            <option value="dark">{t("admin.settings.theme.dark")}</option>
            <option value="system">{t("admin.settings.theme.system")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("admin.settings.defaultLanguage")}</label>
          <select
            className={SELECT_CLASS}
            value={settings.general.defaultLanguage}
            onChange={(e) => settings.setGeneral((c) => ({ ...c, defaultLanguage: e.target.value as typeof c.defaultLanguage }))}
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.settings.sectionReader")}</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("admin.settings.fontFamily")}</label>
          <select
            className={SELECT_CLASS}
            value={settings.reader.fontFamily}
            onChange={(e) => settings.setReader((c) => ({ ...c, fontFamily: e.target.value as typeof c.fontFamily }))}
          >
            <option value="sans">{t("admin.settings.font.sans")}</option>
            <option value="serif">{t("admin.settings.font.serif")}</option>
            <option value="literary">{t("admin.settings.font.literary")}</option>
          </select>
        </div>

        <Input
          label={t("admin.settings.fontSize")}
          type="number"
          min={14}
          max={28}
          value={settings.reader.fontSize}
          onChange={(e) => settings.setReader((c) => ({ ...c, fontSize: Number(e.target.value) }))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("admin.settings.readingWidth")}</label>
          <select
            className={SELECT_CLASS}
            value={settings.reader.readingWidth}
            onChange={(e) => settings.setReader((c) => ({ ...c, readingWidth: e.target.value as typeof c.readingWidth }))}
          >
            <option value="narrow">{t("admin.settings.width.narrow")}</option>
            <option value="comfortable">{t("admin.settings.width.comfortable")}</option>
            <option value="wide">{t("admin.settings.width.wide")}</option>
          </select>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-bold text-foreground">{t("admin.settings.sectionUpload")}</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{t("admin.settings.allowedFileTypes")}</label>
          <div className="flex gap-4">
            {(["pdf", "docx"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={settings.upload.allowedTypes.includes(type)}
                  onChange={() => toggleFileType(type)}
                  className="h-4 w-4 rounded border-input"
                />
                .{type}
              </label>
            ))}
          </div>
        </div>

        <Input
          label={t("admin.settings.maxUploadSize")}
          type="number"
          min={1}
          max={200}
          value={settings.upload.maxUploadSizeMb}
          onChange={(e) => settings.setUpload((c) => ({ ...c, maxUploadSizeMb: Number(e.target.value) }))}
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          {t("admin.settings.save")}
        </Button>
      </div>
    </div>
  );
}
