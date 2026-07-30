"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { STORAGE_KEYS } from "@/constants";
import { getCommentsByBookId } from "@/data/comments";
import type { Comment } from "@/types/book-details";

function readLocalComments(storageKey: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

/**
 * Comments for a single book: the dummy seed data plus anything the
 * current browser has posted, persisted in localStorage per bookId.
 * Same mock-write pattern as useBookReviews — see that hook's note.
 */
export function useBookComments(bookId: string) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const storageKey = `${STORAGE_KEYS.userComments}:${bookId}`;
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  useEffect(() => {
    setLocalComments(readLocalComments(storageKey));
  }, [storageKey]);

  const submitComment = useCallback(
    (text: string) => {
      if (!user) {
        addToast({ title: t("bookDetails.actions.loginRequired") });
        return;
      }
      if (!text.trim()) return;

      const comment: Comment = {
        id: crypto.randomUUID(),
        bookId,
        userName: user.name,
        userAvatarUrl: user.avatarUrl,
        text: text.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setLocalComments((current) => {
        const next = [comment, ...current];
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });

      addToast({ title: t("bookDetails.comments.submitSuccess") });
    },
    [user, bookId, storageKey, addToast, t]
  );

  const comments = [...localComments, ...getCommentsByBookId(bookId)];

  return { comments, submitComment, canComment: Boolean(user) };
}
