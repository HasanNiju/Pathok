"use client";

import { Avatar } from "@/components/ui/avatar";
import type { Comment } from "@/types/book-details";

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <Avatar name={comment.userName} src={comment.userAvatarUrl} size="sm" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-bold text-foreground">{comment.userName}</span>
          <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
      </div>
    </div>
  );
}
