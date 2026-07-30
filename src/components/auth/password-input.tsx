"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

/**
 * Password field with a show/hide toggle. Mirrors the structure of the
 * design-system Input (module 02) rather than wrapping it, since the extra
 * right-side icon button needs to sit inside the same relative container
 * as the field — not floated on top of Input's own layout.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 flex text-muted-foreground">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>

          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(
              "h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "transition-colors duration-200 ease-soft",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />

          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? t("auth.password.hide") : t("auth.password.show")}
            className="absolute right-3 flex text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
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
PasswordInput.displayName = "PasswordInput";
