"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  destructive?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, items, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-40 mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-soft-lg",
              align === "end" ? "right-0" : "left-0",
              className
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                type="button"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-secondary",
                  item.destructive ? "text-destructive" : "text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
