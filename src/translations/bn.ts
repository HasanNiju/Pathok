/**
 * Bangla dictionary. Key shape must always mirror en.ts exactly —
 * the translation type is derived from English (see translation-context.tsx).
 */
import type en from "./en";

const bn: typeof en = {
  app: {
    name: "পাঠক",
  },
  shell: {
    sidebarPlaceholder: "নেভিগেশন",
    topbarPlaceholder: "পাঠক",
    comingSoon: "এই অংশটি এখনো তৈরি হয়নি",
  },
  theme: {
    light: "হালকা",
    dark: "গাঢ়",
    system: "সিস্টেম",
  },
  language: {
    label: "ভাষা",
  },
};

export default bn;
