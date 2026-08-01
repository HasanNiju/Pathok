"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Monitor,
  Languages,
  LogOut,
  Menu,
  Search,
  User as UserIcon,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/constants";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";

interface TopbarProps {
  className?: string;
  /** Opens the mobile navigation drawer. Omitted (no button rendered) when unset. */
  onMenuClick?: () => void;
}

const THEME_CYCLE = ["light", "dark", "system"] as const;

/**
 * Global top bar: brand mark, mobile nav trigger, quick search shortcut,
 * language/theme switches, and the auth menu. Page-specific actions still
 * belong to the pages that own them, not here.
 */
export function Topbar({ className, onMenuClick }: TopbarProps) {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Avoid rendering theme-dependent UI until mounted, to prevent
  // server/client mismatch (next-themes resolves actual theme client-side).
  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    const current = (theme as (typeof THEME_CYCLE)[number]) ?? "system";
    const nextIndex = (THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex] ?? "system");
  };

  const cycleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === language);
    const next = SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
    setLanguage(next?.code ?? DEFAULT_LANGUAGE);
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const handleLogout = () => {
    logout();
    addToast({ title: t("auth.toasts.loggedOut"), variant: "default" });
    router.push("/login");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur",
        "px-4 py-4 sm:px-6",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t("nav.menu")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden",
              "text-muted-foreground hover:bg-secondary hover:text-foreground",
              "transition-colors duration-200"
            )}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-1 text-lg font-bold tracking-tight text-foreground transition-opacity duration-200 hover:opacity-80"
        >
          <BrandLogo />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/#search"
          aria-label={t("nav.search")}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md",
            "text-muted-foreground hover:bg-secondary hover:text-foreground",
            "transition-colors duration-200"
          )}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </Link>

        <button
          type="button"
          onClick={cycleLanguage}
          aria-label={t("language.label")}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md",
            "text-muted-foreground hover:bg-secondary hover:text-foreground",
            "transition-colors duration-200"
          )}
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
        </button>

        {mounted && (
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={t("theme.light")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-secondary hover:text-foreground",
              "transition-colors duration-200"
            )}
          >
            <ThemeIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {mounted &&
          (user ? (
            <Dropdown
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label={t("auth.nav.account")}
                  className="inline-flex items-center rounded-full transition-opacity duration-200 hover:opacity-80"
                >
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                </button>
              }
              items={[
                {
                  label: t("auth.nav.dashboard"),
                  icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
                  onSelect: () => router.push("/dashboard"),
                },
                ...(user.role === "admin" || user.role === "super_admin"
                  ? [
                      {
                        label: t("nav.adminPanel"),
                        icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
                        onSelect: () => router.push("/admin"),
                      },
                    ]
                  : []),
                {
                  label: t("auth.nav.account"),
                  icon: <UserIcon className="h-4 w-4" aria-hidden="true" />,
                  onSelect: () => router.push("/account"),
                },
                {
                  label: t("auth.nav.logout"),
                  icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
                  onSelect: handleLogout,
                  destructive: true,
                },
              ]}
            />
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                {t("auth.nav.login")}
              </Button>
            </Link>
          ))}
      </div>
    </motion.header>
  );
}
