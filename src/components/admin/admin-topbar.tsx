"use client";

import { useRouter } from "next/navigation";
import { Menu, Home, LogOut } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

/** Slim header for the admin panel: mobile nav trigger, page label, and an
 *  account menu with a way back to the public site (this panel renders as
 *  a full-bleed overlay above the main AppShell — see AdminShell). */
export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    addToast({ title: t("auth.toasts.loggedOut"), variant: "default" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("admin.nav.menu")}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden",
            "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-200"
          )}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">{t("admin.badge")}</span>
      </div>

      {user && (
        <Dropdown
          align="end"
          trigger={
            <button
              type="button"
              aria-label={user.name}
              className="inline-flex items-center gap-2 rounded-full transition-opacity duration-200 hover:opacity-80"
            >
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            </button>
          }
          items={[
            {
              label: t("admin.nav.backToSite"),
              icon: <Home className="h-4 w-4" aria-hidden="true" />,
              onSelect: () => router.push("/"),
            },
            {
              label: t("auth.nav.logout"),
              icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
              onSelect: handleLogout,
              destructive: true,
            },
          ]}
        />
      )}
    </header>
  );
}
