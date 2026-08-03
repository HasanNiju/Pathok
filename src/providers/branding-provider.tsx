"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchSetting } from "@/lib/supabase/settings-service";
import { APP_NAME } from "@/constants";
import type { BrandingSettings } from "@/types/admin";

const DEFAULT_BRANDING: BrandingSettings = {
  siteName: APP_NAME,
  tagline: "Read beautifully.",
};

interface BrandingContextValue {
  branding: BrandingSettings;
  reload: () => void;
}

const BrandingContext = createContext<BrandingContextValue>({ branding: DEFAULT_BRANDING, reload: () => {} });

export function useBranding() {
  return useContext(BrandingContext);
}

/**
 * Branding (Module 05) — identity copy only (site name, tagline).
 *
 * The logo, favicon, and brand color are fixed Pathok brand assets (see
 * BrandMark / BrandWordmark and globals.css) and are intentionally NOT
 * wired up here: they are not meant to vary per deployment, so there is no
 * runtime override for them and no admin control to change them.
 */
export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);

  const reload = () => {
    fetchSetting(createClient(), "branding", DEFAULT_BRANDING).then(setBranding);
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    document.title = branding.siteName;
  }, [branding]);

  return <BrandingContext.Provider value={{ branding, reload }}>{children}</BrandingContext.Provider>;
}
