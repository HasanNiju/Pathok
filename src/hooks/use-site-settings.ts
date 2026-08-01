"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchSetting, saveSetting } from "@/lib/supabase/settings-service";
import type { GeneralSettings, ReaderDefaultSettings, UploadSettings } from "@/types/admin";

const DEFAULT_GENERAL: GeneralSettings = { defaultTheme: "system", defaultLanguage: "en" };
const DEFAULT_READER: ReaderDefaultSettings = { fontFamily: "serif", fontSize: 18, readingWidth: "comfortable" };
const DEFAULT_UPLOAD: UploadSettings = { allowedTypes: ["pdf", "docx"], maxUploadSizeMb: 25 };

export function useSiteSettings() {
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [reader, setReader] = useState<ReaderDefaultSettings>(DEFAULT_READER);
  const [upload, setUpload] = useState<UploadSettings>(DEFAULT_UPLOAD);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      fetchSetting(supabase, "general", DEFAULT_GENERAL),
      fetchSetting(supabase, "reader_defaults", DEFAULT_READER),
      fetchSetting(supabase, "upload", DEFAULT_UPLOAD),
    ]).then(([g, r, u]) => {
      setGeneral(g);
      setReader(r);
      setUpload(u);
      setIsLoading(false);
    });
  }, []);

  const save = async () => {
    const supabase = createClient();
    await Promise.all([
      saveSetting(supabase, "general", general),
      saveSetting(supabase, "reader_defaults", reader),
      saveSetting(supabase, "upload", upload),
    ]);
  };

  return { general, setGeneral, reader, setReader, upload, setUpload, isLoading, save };
}
