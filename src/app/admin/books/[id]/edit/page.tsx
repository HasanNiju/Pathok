"use client";

import { use } from "react";
import { BookForm } from "@/components/admin/book-form";

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BookForm mode="edit" bookId={id} />;
}
