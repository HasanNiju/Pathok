"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  PartyPopper,
  Library,
  Flame,
  Compass,
  Heart,
  Bookmark,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/home/section-header";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { AchievementProgress } from "@/types/dashboard";

interface AchievementsSectionProps {
  achievements: AchievementProgress[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  PartyPopper,
  Library,
  Flame,
  Compass,
  Heart,
  Bookmark,
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const { t } = useTranslation();
  const earnedCount = achievements.filter((a) => a.isEarned).length;

  return (
    <section id="achievements" className="scroll-mt-24">
      <SectionHeader
        title={t("dashboard.achievements.title")}
        subtitle={t("dashboard.achievements.subtitle").replace("{earned}", String(earnedCount)).replace("{total}", String(achievements.length))}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((achievement, index) => {
          const Icon = ICON_MAP[achievement.icon] ?? BookOpen;
          const progressPct = Math.min(100, Math.round((achievement.currentValue / achievement.target) * 100));

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
            >
              <Card className={cn(!achievement.isEarned && "opacity-60")}>
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:p-5">
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-full",
                      achievement.isEarned ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    {achievement.isEarned && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-foreground">{t(achievement.titleKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(achievement.descriptionKey)}</p>
                  </div>

                  {!achievement.isEarned && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
