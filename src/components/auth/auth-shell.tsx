"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BrandWordmark } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

export interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Rendered below the card — typically a "switch to X" link. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Centered, single-card layout every auth screen uses (login, signup,
 * forgot/reset password, OTP, email verification). Renders inside the
 * existing AppShell main region — the Topbar above it already exposes the
 * language switch and dark-mode toggle, so this shell doesn't duplicate them.
 */
export function AuthShell({ title, description, children, footer, className }: AuthShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center py-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative mb-8 flex flex-col items-center gap-3 text-center"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 h-28 w-48 rounded-full bg-primary/20 blur-3xl"
        />
        <BrandWordmark imageHeight={44} className="relative" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full"
      >
        <Card className={cn("w-full", className)}>
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-1.5 text-center">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            {children}
          </CardContent>
        </Card>
      </motion.div>

      {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
