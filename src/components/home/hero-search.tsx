"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { SearchBar } from "@/components/ui/search-bar";

interface HeroSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function HeroSearch({ query, onQueryChange }: HeroSearchProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const greeting = user
    ? t("home.hero.greetingUser").replace("{name}", user.name.split(" ")[0] ?? user.name)
    : t("home.hero.greetingGuest");

  return (
    <section
      id="search"
      className="scroll-mt-24 flex flex-col items-center gap-7 py-10 text-center sm:py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {greeting}
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
          {t("home.hero.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder={t("home.search.placeholder")}
        />
      </motion.div>
    </section>
  );
}
