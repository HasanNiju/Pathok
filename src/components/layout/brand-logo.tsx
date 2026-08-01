"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { useBranding } from "@/providers/branding-provider";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Pixel height of the logo image; width scales automatically. */
  imageHeight?: number;
}

/**
 * Used anywhere the app shows its brand mark (Topbar, Footer, Admin
 * Sidebar, Auth screens) so an uploaded logo (Branding module) appears
 * everywhere at once. Falls back to the BookOpen icon + site name when no
 * logo has been uploaded yet, and swaps to the dark-mode logo variant
 * when one exists and the app is in dark mode.
 */
export function BrandLogo({ className, imageHeight = 22 }: BrandLogoProps) {
  const { branding } = useBranding();
  const { resolvedTheme } = useTheme();

  const logoUrl = resolvedTheme === "dark" && branding.darkLogoUrl ? branding.darkLogoUrl : branding.logoUrl;

  if (logoUrl) {
    return (
      <span className={cn("relative inline-flex items-center", className)} style={{ height: imageHeight }}>
        <Image
          src={logoUrl}
          alt={branding.siteName}
          height={imageHeight}
          width={imageHeight * 4}
          className="h-full w-auto object-contain"
          style={{ height: imageHeight, width: "auto" }}
          unoptimized
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
      {branding.siteName}
    </span>
  );
}
