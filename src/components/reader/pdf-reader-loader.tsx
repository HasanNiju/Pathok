"use client";

import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/loading";
import type { Book } from "@/types/book";

const PdfReaderView = dynamic(() => import("@/components/reader/pdf-reader-view").then((m) => m.PdfReaderView), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Loading size="lg" />
    </div>
  ),
});

export function PdfReaderLoader({ book }: { book: Book }) {
  return <PdfReaderView book={book} />;
}
