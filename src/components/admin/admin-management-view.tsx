"use client";

import { useState } from "react";
import { MoreVertical, Pencil, KeyRound, Ban, CheckCircle2, Trash2, ShieldCheck, Plus, AlertTriangle } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAdminManagement } from "@/hooks/use-admin-management";
import { isValidEmail, isValidPassword, isValidName } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { ManagedUser } from "@/types/admin";

interface AdminFormState {
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
}

const EMPTY_ADMIN_FORM: AdminFormState = { name: "", email: "", password: "", role: "admin" };

export function AdminManagementView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { user } = useAuth();
  const admin = useAdminManagement();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<AdminFormState>(EMPTY_ADMIN_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminFormState, string>>>({});

  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [deleting, setDeleting] = useState<ManagedUser | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_ADMIN_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (target: ManagedUser) => {
    setEditing(target);
    setForm({ name: target.name, email: target.email, password: "", role: target.role as "admin" | "super_admin" });
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!isValidName(form.name)) nextErrors.name = t("admin.admins.form.errors.name");
    if (!editing && !isValidEmail(form.email)) nextErrors.email = t("admin.admins.form.errors.email");
    if (!editing && !isValidPassword(form.password)) nextErrors.password = t("admin.admins.form.errors.password");

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (editing) {
        await admin.update(editing.id, { name: form.name.trim(), role: form.role });
        addToast({ title: t("admin.admins.toast.updated"), variant: "success" });
      } else {
        await admin.create({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
        addToast({ title: t("admin.admins.toast.created"), variant: "success" });
      }
      setFormOpen(false);
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  const handleToggleStatus = async (target: ManagedUser) => {
    const next = target.status === "active" ? "suspended" : "active";
    try {
      await admin.update(target.id, { status: next });
      addToast({ title: next === "suspended" ? t("admin.admins.toast.suspended") : t("admin.admins.toast.activated") });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await admin.remove(deleting.id);
      addToast({ title: t("admin.admins.toast.deleted"), variant: "success" });
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !isValidPassword(newPassword)) return;
    try {
      await admin.resetPassword(resetTarget.id, newPassword);
      addToast({ title: t("admin.admins.toast.passwordReset"), variant: "success" });
      setResetTarget(null);
      setNewPassword("");
    } catch {
      addToast({ title: t("common.error"), variant: "error" });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <BackButton href="/admin" label={t("admin.nav.dashboard")} />

      <SectionHeader
        title={t("admin.nav.admins")}
        subtitle={t("admin.admins.subtitle")}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("admin.admins.new")}
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">{t("admin.admins.summary").replace("{count}", String(admin.admins.length))}</p>

      {admin.isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : admin.admins.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          title={t("admin.admins.empty.title")}
          description={t("admin.admins.empty.description")}
          action={
            <Button variant="outline" size="sm" onClick={openCreate}>
              {t("admin.admins.new")}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {admin.admins.map((target) => (
            <Card key={target.id} className="flex items-center gap-4 p-4">
              <Avatar src={target.avatarUrl} name={target.name} size="md" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-bold text-foreground">{target.name}</p>
                  <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                    {target.role === "super_admin" ? t("admin.admins.role.super_admin") : t("admin.admins.role.admin")}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      target.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {target.status === "active" ? t("admin.users.status.active") : t("admin.users.status.suspended")}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{target.email}</p>
              </div>

              <Dropdown
                trigger={
                  <Button variant="ghost" size="icon" aria-label={t("common.moreActions")}>
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                }
                items={[
                  { label: t("admin.admins.actions.edit"), icon: <Pencil className="h-4 w-4" aria-hidden="true" />, onSelect: () => openEdit(target) },
                  {
                    label: t("admin.admins.actions.resetPassword"),
                    icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
                    onSelect: () => {
                      setResetTarget(target);
                      setNewPassword("");
                    },
                  },
                  {
                    label: target.status === "active" ? t("admin.admins.actions.suspend") : t("admin.admins.actions.activate"),
                    icon:
                      target.status === "active" ? (
                        <Ban className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      ),
                    onSelect: () => handleToggleStatus(target),
                  },
                  {
                    label: t("admin.admins.actions.delete"),
                    icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                    destructive: true,
                    onSelect: () => setDeleting(target),
                  },
                ].filter((item) => target.id !== user?.id || item.label === t("admin.admins.actions.edit"))}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("admin.admins.form.editTitle") : t("admin.admins.form.createTitle")}
      >
        <div className="flex flex-col gap-4">
          <Input label={t("admin.admins.form.name")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          {!editing && (
            <>
              <Input
                label={t("admin.admins.form.email")}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                error={errors.email}
              />
              <Input
                label={t("admin.admins.form.password")}
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                error={errors.password}
              />
            </>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t("admin.admins.form.role")}</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "admin" | "super_admin" }))}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="admin">{t("admin.admins.role.admin")}</option>
              <option value="super_admin">{t("admin.admins.role.super_admin")}</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              {editing ? t("admin.admins.form.save") : t("admin.admins.form.create")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset password */}
      <Modal open={Boolean(resetTarget)} onClose={() => setResetTarget(null)} title={t("admin.admins.resetPasswordDialog.title")}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("admin.admins.resetPasswordDialog.description")}</p>
          <Input
            label={t("admin.admins.resetPasswordDialog.newPassword")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setResetTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleResetPassword} disabled={!isValidPassword(newPassword)}>
              {t("admin.admins.resetPasswordDialog.confirm")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={t("admin.admins.confirmDelete.title")}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg bg-secondary p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm text-foreground">{t("admin.admins.confirmDelete.description")}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              {t("admin.admins.confirmDelete.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
