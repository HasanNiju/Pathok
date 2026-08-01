"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchProgressForBook } from "@/lib/supabase/progress-service";
import type { ReadingProgress } from "@/types/book";

export function useBookProgress(userId: string | undefined, bookId: string) {
  const [progress, setProgress] = useState<ReadingProgress | undefined>(undefined);

  useEffect(() => {
    if (!userId) {
      setProgress(undefined);
      return;
    }
    let active = true;
    fetchProgressForBook(createClient(), userId, bookId).then((result) => {
      if (active) setProgress(result);
    });
    return () => {
      active = false;
    };
  }, [userId, bookId]);

  return progress;
}
