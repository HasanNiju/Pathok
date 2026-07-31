"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { APP_NAME } from "@/constants";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  className?: string;
}

/** Persistent rail for the admin panel — brand mark + AdminNav. Below the
 *  md breakpoint this is replaced by a drawer (see AdminShell). */
export function AdminSidebar({ className }: AdminSidebarProps) {
  const { t } = useTranslation();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex",
        className
      )}
    >
      <Link href="/admin" className="mb-6 flex items-center gap-2 px-1 text-lg font-bold tracking-tight text-foreground">
        <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
        {APP_NAME}
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {t("admin.badge")}
        </span>
      </Link>
      <AdminNav />
    </motion.aside>
  );
}
