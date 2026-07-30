"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/** Consistent heading block for each Home page section (rails, categories, search). */
export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-5 flex items-end justify-between gap-4"
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
