"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  ExternalLink,
  Copy,
  Trash2,
  CheckCircle,
  FileEdit,
  Calendar,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  status: string;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
}

function ArticlesTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  // Filters state
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("categoryId") || "ALL");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("categoryId", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", String(currentPage));
      params.set("limit", "12");

      const [artRes, catRes] = await Promise.all([
        fetch(`/api/admin/articles?${params.toString()}`),
        fetch("/api/admin/categories"),
      ]);

      const artData = await artRes.json();
      const catData = await catRes.json();

      setArticles(artData.articles || []);
      setTotalCount(artData.totalCount || 0);
      setTotalPages(artData.totalPages || 1);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/articles/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        setActionMsg("Article duplicated successfully.");
        setTimeout(() => setActionMsg(""), 3000);
        fetchArticles();
      }
    } catch {
      alert("Failed to duplicate article");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg("Article deleted.");
        setTimeout(() => setActionMsg(""), 3000);
        fetchArticles();
      }
    } catch {
      alert("Failed to delete article");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/articles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setActionMsg(`Status changed to ${nextStatus}.`);
        setTimeout(() => setActionMsg(""), 3000);
        fetchArticles();
      }
    } catch {
      alert("Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and New Article CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif">
            Article Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Manage, review, publish, and schedule all articles across KNOWVIA.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          + New Article
        </Link>
      </div>

      {actionMsg && (
        <div className="rounded-xl bg-sky-50 p-3 text-xs font-semibold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          {actionMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: "ALL", label: "All Articles" },
            { id: "PUBLISHED", label: "Published" },
            { id: "DRAFT", label: "Drafts" },
            { id: "SCHEDULED", label: "Scheduled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search articles by title or keyword..."
              className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <p className="text-sm text-zinc-500">No articles found matching your criteria.</p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              <PlusCircle className="h-4 w-4" />
              Create New Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 sm:px-6 w-16">Cover</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                {articles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6">
                      <div className="h-10 w-14 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                        {art.coverImage ? (
                          <img
                            src={art.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">
                            None
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-white max-w-xs sm:max-w-md truncate">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-serif"
                      >
                        {art.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium">
                        {art.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(art.id, art.status)}
                        title="Click to toggle publish status"
                        className="cursor-pointer"
                      >
                        {art.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        ) : art.status === "SCHEDULED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap text-xs">
                      {formatDate(art.publishedAt || art.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-zinc-600 dark:text-zinc-400">
                      {art.views}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap space-x-1">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="inline-flex items-center p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        title="Edit article"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {art.status === "PUBLISHED" ? (
                        <Link
                          href={`/articles/${art.slug}`}
                          target="_blank"
                          className="inline-flex items-center p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-sky-600 dark:hover:bg-zinc-800"
                          title="Preview live article"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/articles/${art.id}/edit?preview=true`}
                          className="inline-flex items-center p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-sky-600 dark:hover:bg-zinc-800"
                          title="Preview draft"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDuplicate(art.id)}
                        className="inline-flex items-center p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
                        title="Duplicate article"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id, art.title)}
                        className="inline-flex items-center p-1.5 rounded-lg text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Delete article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 p-4 text-xs text-zinc-500">
            <div>
              Showing page {currentPage} of {totalPages} ({totalCount} total)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminArticlesListPage() {
  return (
    <AdminLayoutShell>
      <Suspense fallback={<div className="p-12 text-center text-xs text-zinc-400">Loading articles...</div>}>
        <ArticlesTableContent />
      </Suspense>
    </AdminLayoutShell>
  );
}
