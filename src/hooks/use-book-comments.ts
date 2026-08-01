"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { fetchComments, submitCommentRow } from "@/lib/supabase/reviews-service";
import type { Comment } from "@/types/book-details";

/**
 * Comments for a single book — fetched from and written to Supabase's
 * `comments` table.
 */
export function useBookComments(bookId: string) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchComments(createClient(), bookId).then(setComments);
  }, [bookId]);

  const submitComment = useCallback(
    async (text: string) => {
      if (!user) {
        addToast({ title: t("bookDetails.actions.loginRequired") });
        return;
      }
      if (!text.trim()) return;

      try {
        await submitCommentRow(createClient(), { bookId, userId: user.id, text: text.trim() });
        setComments((current) => [
          {
            id: crypto.randomUUID(),
            bookId,
            userName: user.name,
            userAvatarUrl: user.avatarUrl,
            text: text.trim(),
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...current,
        ]);
        addToast({ title: t("bookDetails.comments.submitSuccess") });
      } catch {
        addToast({ title: t("common.error"), variant: "error" });
      }
    },
    [user, bookId, addToast, t]
  );

  return { comments, submitComment, canComment: Boolean(user) };
}
