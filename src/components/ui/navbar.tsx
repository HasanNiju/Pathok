import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  brand: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Generic top navigation primitive — a design-system component, distinct
 * from components/layout/topbar.tsx (the app-shell instance built in
 * Module 01, left untouched). Feature modules compose this for
 * page-level navbars via slots rather than hardcoded content.
 */
export function Navbar({ brand, center, actions, className }: NavbarProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:px-6",
        className
      )}
    >
      <div className="flex items-center gap-2">{brand}</div>
      {center && <div className="hidden flex-1 items-center justify-center md:flex">{center}</div>}
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
