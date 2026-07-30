import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "transition-colors duration-200 ease-soft",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error && textareaId ? `${textareaId}-error` : undefined}
          {...props}
        />

        {error && (
          <p id={textareaId ? `${textareaId}-error` : undefined} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
