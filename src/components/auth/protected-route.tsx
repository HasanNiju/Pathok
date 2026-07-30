"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";
import { Loading } from "@/components/ui/loading";

export interface ProtectedRouteProps {
  children: ReactNode;
  /** If omitted, any authenticated role (user or admin) may access. */
  allowedRoles?: UserRole[];
  /** Where to send unauthenticated visitors. Defaults to /login. */
  redirectTo?: string;
}

/**
 * Guards a page behind authentication, and optionally a role allow-list.
 * Usage:
 *   <ProtectedRoute><AccountPage /></ProtectedRoute>
 *   <ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>
 */
export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isRoleAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role) : false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (!isRoleAllowed) {
      router.replace("/");
    }
  }, [isLoading, user, isRoleAllowed, redirectTo, router]);

  if (isLoading || !user || !isRoleAllowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
