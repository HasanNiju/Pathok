"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { BrandWordmark } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { ResponsiveContainer } from "@/components/layout/responsive-container";

interface FooterProps {
  className?: string;
}

const EXPLORE_LINKS = [
  { key: "home", href: "/" },
  { key: "categories", href: "/#categories" },
  { key: "trending", href: "/#trending" },
] as const;

/**
 * Pages this module doesn't build yet (About, Careers, Contact, legal
 * copy). Rather than link to routes that don't exist, these open the same
 * "not built yet" toast the rest of the app uses — honest, not a dead link.
 */
const UNBUILT_LINK_KEYS = {
  company: ["about", "careers", "contact"],
  legal: ["privacy", "terms"],
} as const;

export function Footer({ className }: FooterProps) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const notifyNotBuilt = () => addToast({ title: t("shell.comingSoon") });

  return (
    <footer className={cn("border-t border-border bg-card", className)}>
      <ResponsiveContainer className="grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-16">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex w-fit items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <BrandWordmark imageHeight={30} />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-foreground">{t("footer.columns.explore")}</p>
          <ul className="flex flex-col gap-2.5">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {t(`footer.links.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-foreground">{t("footer.columns.company")}</p>
          <ul className="flex flex-col gap-2.5">
            {UNBUILT_LINK_KEYS.company.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={notifyNotBuilt}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {t(`footer.links.${key}`)}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-sm font-bold text-foreground">{t("footer.columns.legal")}</p>
          <ul className="flex flex-col gap-2.5">
            {UNBUILT_LINK_KEYS.legal.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={notifyNotBuilt}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {t(`footer.links.${key}`)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </ResponsiveContainer>

      <div className="border-t border-border">
        <ResponsiveContainer className="py-6">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}
          </p>
        </ResponsiveContainer>
      </div>
    </footer>
  );
}
