"use client";

import { useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface WriteCommentFormProps {
  canComment: boolean;
  onSubmit: (text: string) => void;
}

export function WriteCommentForm({ canComment, onSubmit }: WriteCommentFormProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  if (!canComment) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground">{t("bookDetails.comments.loginPrompt")}</p>
        <Link href="/login">
          <Button variant="outline" size="sm">
            {t("auth.nav.login")}
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t("bookDetails.comments.placeholder")}
        rows={2}
      />
      <Button size="sm" onClick={handleSubmit} disabled={!text.trim()} className="w-fit">
        {t("bookDetails.comments.submit")}
      </Button>
    </div>
  );
}
