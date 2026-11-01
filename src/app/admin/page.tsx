"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import {
  FileText,
  CheckCircle,
  FileEdit,
  Calendar,
  Eye,
  PlusCircle,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
    totalViews: 0,
  });
  const [recentArticles, setRecentArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    try {
      const [analyticsRes, articlesRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/articles?limit=8"),
      ]);

      const analyticsData = await analyticsRes.json();
      const articlesData = await articlesRes.json();

      setStats({
        totalArticles: analyticsData.totalArticles || 0,
        publishedArticles: analyticsData.publishedArticles || 0,
        draftArticles: analyticsData.draftArticles || 0,
        scheduledArticles: analyticsData.scheduledArticles || 0,
        totalViews: analyticsData.totalViews || 0,
      });

      setRecentArticles(articlesData.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/articles/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        setActionMsg("Article duplicated as draft!");
        setTimeout(() => setActionMsg(""), 3000);
        loadData();
      }
    } catch {
      alert("Failed to duplicate article");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg("Article deleted.");
        setTimeout(() => setActionMsg(""), 3000);
        loadData();
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
        setActionMsg(`Article status updated to ${nextStatus}.`);
        setTimeout(() => setActionMsg(""), 3000);
        loadData();
      }
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-8">
        {/* Top bar title & CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif">
              Editorial Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Welcome back to KNOWVIA. Overview of publications, drafts, and readership.
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
          <div className="rounded-xl bg-sky-50 p-3 text-xs font-semibold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 animate-in fade-in">
            {actionMsg}
          </div>
        )}

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {/* Total Articles */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
              <FileText className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {stats.totalArticles}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">All registered articles</p>
          </div>

          {/* Published */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Published</span>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.publishedArticles}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Live on public site</p>
          </div>

          {/* Drafts */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Drafts</span>
              <FileEdit className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.draftArticles}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Unpublished drafts</p>
          </div>

          {/* Scheduled */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Scheduled</span>
              <Calendar className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              {stats.scheduledArticles}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Auto-publish queues</p>
          </div>

          {/* Total Views */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Views</span>
              <Eye className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Direct page reads</p>
          </div>
        </div>

        {/* Recent Articles Table */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white font-serif">
                Recent Articles
              </h2>
              <p className="text-xs text-zinc-400">
                Latest editorial entries and active revisions
              </p>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              Loading articles...
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-zinc-500">No articles created yet.</p>
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600"
              >
                + Write your first article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Views</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                  {recentArticles.map((art) => (
                    <tr
                      key={art.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-900 dark:text-white max-w-xs sm:max-w-md truncate">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                          {art.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium">
                          {art.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap text-xs">
                        {formatDate(art.publishedAt || art.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-zinc-600 dark:text-zinc-400">
                        {art.views}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap space-x-1">
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
        </div>
      </div>
    </AdminLayoutShell>
  );
}
