"use client";

import { useCallback, useEffect, useState } from "react";
import type { ManagedUser } from "@/types/admin";

export function useAdminUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
    const result = await response.json();
    setUsers(response.ok ? result.users : []);
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(reload, 250);
    return () => window.clearTimeout(timeout);
  }, [reload]);

  const setStatus = useCallback(
    async (id: string, status: "active" | "suspended") => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Request failed.");
      setUsers((current) => current.map((u) => (u.id === id ? { ...u, status } : u)));
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error((await response.json()).error ?? "Request failed.");
    setUsers((current) => current.filter((u) => u.id !== id));
  }, []);

  return { users, search, setSearch, isLoading, setStatus, remove, reload };
}
