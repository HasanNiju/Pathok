"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { BookForm } from "@/components/admin/book-form";

/**
 * Book Creation entry point (Module 01 upload workflow). Reused by the
 * admin Quick Actions shortcut and the Book Management "New Book" button.
 */
export default function CreatePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <BookForm mode="create" />
    </ProtectedRoute>
  );
}
