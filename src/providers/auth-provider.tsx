"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "@/context/auth-context";
import { realAuth } from "@/lib/supabase/auth-service";
import type { AuthUser, LoginInput, OtpPurpose, SignupInput } from "@/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the real Supabase session on load, then keep listening for
  // login/logout events (including ones triggered from another tab).
  useEffect(() => {
    let active = true;

    realAuth.getSessionUser().then((sessionUser) => {
      if (active) {
        setUser(sessionUser);
        setIsLoading(false);
      }
    });

    const subscription = realAuth.onAuthStateChange((nextUser) => {
      if (active) setUser(nextUser);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const authUser = await realAuth.login(input);
    setUser(authUser);
    return authUser;
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    await realAuth.signup(input);
    // Not logged in yet — email must be verified via OTP first.
  }, []);

  const logout = useCallback(async () => {
    await realAuth.logout();
    setUser(null);
  }, []);

  const requestOtp = useCallback((email: string, purpose: OtpPurpose) => {
    return realAuth.requestOtp(email, purpose);
  }, []);

  const resendOtp = useCallback((email: string, purpose: OtpPurpose) => {
    return realAuth.resendOtp(email, purpose);
  }, []);

  const verifyOtp = useCallback(async (email: string, purpose: OtpPurpose, code: string) => {
    await realAuth.verifyOtp(email, purpose, code);
  }, []);

  const forgotPassword = useCallback((email: string) => {
    return realAuth.requestOtp(email, "reset");
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    await realAuth.resetPassword(email, newPassword);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      requestOtp,
      resendOtp,
      verifyOtp,
      forgotPassword,
      resetPassword,
    }),
    [user, isLoading, login, signup, logout, requestOtp, resendOtp, verifyOtp, forgotPassword, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
