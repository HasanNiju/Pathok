import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-medium text-secondary-foreground",
        SIZE_CLASSES[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="56px" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}
