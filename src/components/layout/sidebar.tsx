"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

/**
 * Structural placeholder only. Navigation links/sections are owned by the
 * modules that introduce those routes (Library, Reader, Admin, etc.) and
 * will be slotted in here later — this module only establishes the shell.
 */
export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border bg-card",
        "px-6 py-8",
        className
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">
        {t("shell.sidebarPlaceholder")}
      </p>
    </motion.aside>
  );
}
