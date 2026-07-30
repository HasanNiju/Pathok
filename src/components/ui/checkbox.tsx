import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

/**
 * Design-system checkbox. Module 02 didn't need one; the Auth module
 * introduces it here (for "Remember Me") as a reusable primitive, following
 * the same token/variant conventions as Button/Input.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label htmlFor={inputId} className="inline-flex cursor-pointer items-center gap-2 select-none">
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            className={cn(
              "peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border border-input bg-background",
              "transition-colors duration-200 ease-soft",
              "checked:border-primary checked:bg-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              className
            )}
            {...props}
          />
          <Check
            className="pointer-events-none absolute h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
            aria-hidden="true"
          />
        </span>
        {label && <span className="text-sm text-foreground">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
