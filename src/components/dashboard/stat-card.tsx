"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delay?: number;
}

/** A single number-forward metric tile — four to six of these make up the
 *  Statistics section's grid. Deliberately minimal: icon, big value, label. */
export function StatCard({ icon: Icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{value}</span>
            <span className="truncate text-xs text-muted-foreground">{label}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
