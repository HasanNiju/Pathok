"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { ProtectedRoute, RoleBadge } from "@/components/auth";
import { Card, CardContent, Avatar, Button } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

function AccountContent() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  if (!user) return null;

  function handleLogout() {
    logout();
    addToast({ title: t("auth.toasts.loggedOut") });
    router.push("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">{t("auth.account.title")}</h1>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t("auth.account.roleLabel")}</span>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t("auth.account.statusLabel")}</span>
              <span className="text-sm font-medium">
                {user.isEmailVerified ? t("auth.account.verified") : t("auth.account.notVerified")}
              </span>
            </div>
          </div>

          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-fit">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t("auth.account.logout")}
          </Button>
        </CardContent>
      </Card>

      {user.role === "admin" && (
        <Card className="border-amber-500/30 bg-amber-500/[0.04]">
          <CardContent className="flex items-start gap-3 p-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-bold">{t("auth.account.adminPanelTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("auth.account.adminPanelDescription")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Any authenticated role (user or admin) can view their own account.
 * The admin-only block above is an additional in-page role check —
 * ProtectedRoute's allowedRoles is for gating an entire route, e.g.:
 *   <ProtectedRoute allowedRoles={["admin"]}>...</ProtectedRoute>
 */
export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
