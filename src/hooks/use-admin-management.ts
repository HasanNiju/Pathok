"use client";

import { useCallback, useEffect, useState } from "react";
import type { ManagedUser } from "@/types/admin";

export interface NewAdminInput {
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
}

export function useAdminManagement() {
  const [admins, setAdmins] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/admins");
    const result = await response.json();
    setAdmins(response.ok ? result.admins : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (input: NewAdminInput) => {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Request failed.");
      await reload();
    },
    [reload]
  );

  const update = useCallback(
    async (id: string, patch: { name?: string; role?: "admin" | "super_admin"; status?: "active" | "suspended" }) => {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Request failed.");
      await reload();
    },
    [reload]
  );

  const remove = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Request failed.");
      await reload();
    },
    [reload]
  );

  const resetPassword = useCallback(async (id: string, newPassword: string) => {
    const response = await fetch(`/api/admin/admins/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Request failed.");
  }, []);

  return { admins, isLoading, create, update, remove, resetPassword, reload };
}
