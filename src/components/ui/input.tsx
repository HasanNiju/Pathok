import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3 flex text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "transition-colors duration-200 ease-soft",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              icon && "pl-9",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p id={inputId ? `${inputId}-error` : undefined} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
