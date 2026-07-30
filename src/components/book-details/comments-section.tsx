"use client";

import { MessagesSquare } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { EmptyState } from "@/components/home/empty-state";
import { WriteCommentForm } from "@/components/book-details/write-comment-form";
import { CommentItem } from "@/components/book-details/comment-item";
import { useTranslation } from "@/hooks/use-translation";
import { useBookComments } from "@/hooks/use-book-comments";
import type { Book } from "@/types/book";

export function CommentsSection({ book }: { book: Book }) {
  const { t } = useTranslation();
  const { comments, submitComment, canComment } = useBookComments(book.id);

  return (
    <section id="comments" className="scroll-mt-24">
      <SectionHeader title={t("bookDetails.comments.title")} subtitle={t("bookDetails.comments.subtitle")} />

      <div className="flex flex-col gap-5">
        <WriteCommentForm canComment={canComment} onSubmit={submitComment} />

        {comments.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
            title={t("bookDetails.comments.emptyTitle")}
            description={t("bookDetails.comments.emptyDescription")}
          />
        ) : (
          <div className="rounded-xl border border-border px-5 sm:px-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
