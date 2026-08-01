"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchSetting } from "@/lib/supabase/settings-service";
import { hexToHslString } from "@/lib/color";
import { APP_NAME } from "@/constants";
import type { BrandingSettings } from "@/types/admin";

const DEFAULT_BRANDING: BrandingSettings = {
  siteName: APP_NAME,
  tagline: "Read beautifully.",
  logoUrl: "",
  darkLogoUrl: "",
  faviconUrl: "",
  accentColor: "#2563eb",
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
 * Branding (Module 05). Fetched once on load and applied globally: the
 * accent color drives --primary (so every primary-colored element in the
 * app updates at once), the site name updates <title>, and the favicon
 * link is swapped if one has been uploaded. Every component that used to
 * hardcode APP_NAME should read `useBranding().branding.siteName` instead.
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
    const hsl = hexToHslString(branding.accentColor);
    if (hsl) document.documentElement.style.setProperty("--primary", hsl);

    document.title = branding.siteName;

    if (branding.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
  }, [branding]);

  return <BrandingContext.Provider value={{ branding, reload }}>{children}</BrandingContext.Provider>;
}
