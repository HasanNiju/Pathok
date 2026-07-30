"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            {icon}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-foreground">{title}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
          </div>
          {action}
        </CardContent>
      </Card>
    </motion.div>
  );
}
