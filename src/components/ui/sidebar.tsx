"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Generic, reusable navigation sidebar — a design-system primitive that
 * takes its items as props. This is intentionally separate from
 * components/layout/sidebar.tsx (the app-shell placeholder built in
 * Module 01, left untouched); feature modules can adopt this one once
 * real navigation/routes exist.
 */
export function Sidebar({ items, header, footer, className }: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6",
        className
      )}
    >
      {header && <div className="mb-6 px-2">{header}</div>}

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                item.active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {footer && <div className="mt-6 px-2">{footer}</div>}
    </motion.aside>
  );
}
