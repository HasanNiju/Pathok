"use client";

import { useState } from "react";
import { MoreVertical, Ban, CheckCircle2, Trash2, Users, AlertTriangle } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { BackButton } from "@/components/ui/back-button";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { cn } from "@/lib/utils";
import type { ManagedUser } from "@/types/admin";

/** User Management (Module 03) — Admin/Super Admin only, backed by the
 *  service-role API routes since profiles alone don't carry email. */
export function AdminUsersView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const admin = useAdminUsers();
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);

  const handleToggleStatus = async (targetUser: ManagedUser) => {
    const next = targetUser.status === "active" ? "suspended" : "active";
    try {
      await admin.setStatus(targetUser.id, next);
      addToast({ title: next === "suspended" ? t("admin.users.toast.suspended") : t("admin.users.toast.activated") });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await admin.remove(deleting.id);
      addToast({ title: t("admin.users.toast.deleted"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <BackButton href="/admin" label={t("admin.nav.dashboard")} />
      <SectionHeader title={t("admin.nav.users")} subtitle={t("admin.users.subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={admin.search}
          onChange={admin.setSearch}
          placeholder={t("admin.users.searchPlaceholder")}
          className="sm:max-w-xs"
        />
        <p className="text-sm text-muted-foreground">{t("admin.users.summary").replace("{count}", String(admin.users.length))}</p>
      </div>

      {admin.isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : admin.users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          title={t("admin.users.empty.title")}
          description={t("admin.users.empty.description")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {admin.users.map((managedUser) => (
            <Card key={managedUser.id} className="flex items-center gap-4 p-4">
              <Avatar src={managedUser.avatarUrl} name={managedUser.name} size="md" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-bold text-foreground">{managedUser.name}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      managedUser.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {managedUser.status === "active" ? t("admin.users.status.active") : t("admin.users.status.suspended")}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{managedUser.email}</p>
              </div>

              <Dropdown
                trigger={
                  <Button variant="ghost" size="icon" aria-label={t("common.moreActions")}>
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                }
                items={[
                  {
                    label: managedUser.status === "active" ? t("admin.users.actions.suspend") : t("admin.users.actions.activate"),
                    icon:
                      managedUser.status === "active" ? (
                        <Ban className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      ),
                    onSelect: () => handleToggleStatus(managedUser),
                  },
                  {
                    label: t("admin.users.actions.delete"),
                    icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                    destructive: true,
                    onSelect: () => setDeleting(managedUser),
                  },
                ]}
              />
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={t("admin.users.confirmDelete.title")}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm text-foreground">{t("admin.users.confirmDelete.description")}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              {t("admin.users.confirmDelete.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
