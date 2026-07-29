"use client";

import { createContext } from "react";
import type { AuthUser, LoginInput, OtpPurpose, SignupInput } from "@/types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until the initial session restore (from storage) has finished. */
  isLoading: boolean;

  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;

  /** Sends a code and returns it (mock — no email backend to deliver it). */
  requestOtp: (email: string, purpose: OtpPurpose) => Promise<string>;
  resendOtp: (email: string, purpose: OtpPurpose) => Promise<string>;
  verifyOtp: (email: string, purpose: OtpPurpose, code: string) => Promise<void>;

  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
