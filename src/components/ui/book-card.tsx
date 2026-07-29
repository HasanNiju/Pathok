"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface BookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  /** 0–100. Omit entirely for a book that hasn't been started. */
  progress?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * The primary content card for a book across the app (library grids,
 * search results, "continue reading" rails). Cover uses a fixed 2:3 book
 * aspect ratio; falls back to a plain icon tile when no cover is supplied
 * (dummy data won't always include one).
 */
export function BookCard({
  title,
  author,
  coverUrl,
  progress,
  onClick,
  className,
}: BookCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      <Card
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={(event) => {
          if (isInteractive && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onClick?.();
          }
        }}
        className={cn(
          "overflow-hidden p-0",
          isInteractive &&
            "cursor-pointer transition-shadow duration-200 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div className="relative aspect-[3/4] w-full bg-secondary">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 200px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{author}</p>

          {typeof progress === "number" && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
