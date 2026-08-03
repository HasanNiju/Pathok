"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

/**
 * Pathok's brand mark. Fixed brand assets — always the red colorway in both
 * light and dark mode, and not swappable from the admin panel (branding is
 * a locked identity, not a per-deployment setting).
 *
 * - BrandMark: the icon alone. Used in compact chrome (Topbar, Admin
 *   sidebar) where a full wordmark would be cramped.
 * - BrandWordmark: the full logo mark. Used wherever the brand stands
 *   alone (Footer, auth screens). Automatically swaps between the English
 *   and Bengali wordmark to match the active language.
 */

interface BrandMarkProps {
  className?: string;
  /** Pixel height of the icon; width scales to match its aspect ratio. */
  size?: number;
}

export function BrandMark({ className, size = 32 }: BrandMarkProps) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center", className)} style={{ height: size, width: size }}>
      <Image
        src="/brand/icon-red.png"
        alt="Pathok"
        fill
        className="object-contain"
        sizes={`${size}px`}
        priority
      />
    </span>
  );
}

interface BrandWordmarkProps {
  className?: string;
  /** Pixel height of the wordmark; width scales automatically. */
  imageHeight?: number;
}

export function BrandWordmark({ className, imageHeight = 32 }: BrandWordmarkProps) {
  const { language } = useTranslation();
  const src = language === "bn" ? "/brand/wordmark-bn-red.png" : "/brand/wordmark-en-red.png";

  return (
    <span className={cn("relative inline-flex items-center", className)} style={{ height: imageHeight }}>
      <Image
        key={src}
        src={src}
        alt="Pathok"
        height={imageHeight}
        width={imageHeight * 4}
        className="h-full w-auto object-contain"
        style={{ height: imageHeight, width: "auto" }}
        priority
      />
    </span>
  );
}

