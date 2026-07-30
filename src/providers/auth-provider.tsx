"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "@/context/auth-context";
import { mockAuth } from "@/lib/mock-auth";
import type { AuthUser, LoginInput, OtpPurpose, SignupInput } from "@/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore a persisted session (localStorage for "remember me", otherwise
  // sessionStorage) once on mount — same pattern as TranslationProvider.
  useEffect(() => {
    setUser(mockAuth.readSession());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const authUser = await mockAuth.login(input);
    mockAuth.persistSession(authUser, input.rememberMe);
    setUser(authUser);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    await mockAuth.signup(input);
    // Not logged in yet — email must be verified via OTP first.
  }, []);

  const logout = useCallback(() => {
    mockAuth.clearSession();
    setUser(null);
  }, []);

  const requestOtp = useCallback((email: string, purpose: OtpPurpose) => {
    return mockAuth.requestOtp(email, purpose);
  }, []);

  const resendOtp = useCallback((email: string, purpose: OtpPurpose) => {
    return mockAuth.resendOtp(email, purpose);
  }, []);

  const verifyOtp = useCallback(async (email: string, purpose: OtpPurpose, code: string) => {
    await mockAuth.verifyOtp(email, purpose, code);
  }, []);

  const forgotPassword = useCallback((email: string) => {
    return mockAuth.requestOtp(email, "reset");
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    await mockAuth.resetPassword(email, newPassword);
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
