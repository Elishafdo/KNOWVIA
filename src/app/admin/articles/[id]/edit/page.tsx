"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function EditArticlePage() {
  const params = useParams();
  const id = params?.id as string;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data.article);
      })
      .catch((err) => {
        setError(err.message || "Failed to load article");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminLayoutShell>
      {loading ? (
        <div className="flex h-64 items-center justify-center text-xs text-zinc-400">
          Loading article editor...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          {error}
        </div>
      ) : article ? (
        <ArticleEditor initialArticle={article} isNew={false} />
      ) : null}
    </AdminLayoutShell>
  );
}
