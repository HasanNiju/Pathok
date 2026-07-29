import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Base horizontal rhythm for the whole app. Every page/section should wrap
 * its content in this instead of redefining max-width/padding locally.
 */
export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return <div className={cn("container mx-auto w-full", className)}>{children}</div>;
}
