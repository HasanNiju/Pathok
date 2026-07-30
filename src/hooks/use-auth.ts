"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

/**
 * Access the current user, session state, and every auth action
 * (login/signup/logout/OTP/password reset). Must be used within
 * <AuthProvider> (mounted in AppProviders).
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
