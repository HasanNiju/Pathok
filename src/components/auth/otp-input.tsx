"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/** Six single-digit boxes that behave as one controlled OTP value. */
export function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, LENGTH));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    const lastIndex = Math.min(pasted.length, LENGTH) - 1;
    inputRefs.current[lastIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-12 w-10 rounded-lg border border-input bg-background text-center text-lg font-bold text-foreground sm:h-14 sm:w-12",
            "transition-colors duration-200 ease-soft",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      ))}
    </div>
  );
}
