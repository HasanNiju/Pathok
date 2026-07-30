"use client";

import { getPasswordStrength } from "@/lib/validation";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-500",
  "bg-primary",
  "bg-emerald-500",
] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();

  if (!password) return null;

  const { score, label } = getPasswordStrength(password);
  const barColor = BAR_COLORS[score] ?? BAR_COLORS[0];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-secondary transition-colors duration-200 ease-soft",
              index < score && barColor
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("auth.password.strength")}: {t(`auth.password.strengthLabels.${label}`)}
      </p>
    </div>
  );
}
