"use client";

import React from "react";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function NewArticlePage() {
  return (
    <AdminLayoutShell>
      <ArticleEditor isNew={true} />
    </AdminLayoutShell>
  );
}
