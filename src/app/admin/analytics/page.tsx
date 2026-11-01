"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import {
  BarChart3,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Info,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AnalyticsData {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  categoriesCount: number;
  totalViews: number;
  topArticles: {
    id: string;
    title: string;
    slug: string;
    views: number;
    publishedAt: string | null;
    category?: { name: string };
  }[];
  recentViews: {
    id: string;
    path: string;
    createdAt: string;
    article?: { title: string; slug: string } | null;
  }[];
  isExternalProviderConnected: boolean;
  connectedProviderName: string | null;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif">
            Readership & Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Real performance metrics and direct page view audits across published KNOWVIA articles.
          </p>
        </div>

        {/* External Provider Status Notice */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-sky-900 dark:text-sky-200">
                Third-Party Analytics Integration Status: Ready to Connect
              </h3>
              <p className="text-xs text-sky-800/80 dark:text-sky-300 leading-relaxed">
                External tracking (such as Google Analytics 4, Plausible, or Umami) is not currently connected. 
                All statistics below are genuinely measured from direct reader requests in the KNOWVIA database. 
                No synthetic or simulated metrics are displayed.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">Loading analytics...</div>
        ) : data ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Total Views</span>
                  <Eye className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="mt-3 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {data.totalViews.toLocaleString()}
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Total cumulative reads</p>
              </div>

              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Published</span>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {data.publishedArticles}
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Active public articles</p>
              </div>

              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Articles</span>
                  <FileText className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">
                  {data.totalArticles}
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Published + Drafts</p>
              </div>

              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Topics</span>
                  <BarChart3 className="h-4 w-4 text-sky-600" />
                </div>
                <div className="mt-3 text-3xl font-black text-sky-600 dark:text-sky-400">
                  {data.categoriesCount}
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Active categories</p>
              </div>
            </div>

            {/* Top Articles Table */}
            <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-base font-bold font-serif text-zinc-900 dark:text-white">
                  Most Viewed Articles
                </h2>
                <p className="text-xs text-zinc-400">
                  Ranking based on total reader page impressions
                </p>
              </div>

              {data.topArticles.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No view data recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-3 px-4 sm:px-6">Article</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Published</th>
                        <th className="py-3 px-4 sm:px-6 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                      {data.topArticles.map((art, idx) => (
                        <tr key={art.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-900 dark:text-white max-w-sm truncate">
                            <span className="text-zinc-400 font-mono mr-2">#{idx + 1}</span>
                            <Link
                              href={`/articles/${art.slug}`}
                              target="_blank"
                              className="hover:text-sky-600 dark:hover:text-sky-400 font-serif"
                            >
                              {art.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                            {art.category?.name || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap text-xs">
                            {formatDate(art.publishedAt)}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                            {art.views.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent View Audit Log */}
            <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-base font-bold font-serif text-zinc-900 dark:text-white">
                  Recent View Activity Log
                </h2>
                <p className="text-xs text-zinc-400">
                  Chronological trail of raw reader views recorded in the database
                </p>
              </div>

              {data.recentViews.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No views recorded in log yet. Visit an article on the public site to record views!
                </div>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {data.recentViews.map((log) => (
                    <li key={log.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {log.article?.title || log.path}
                        </span>
                      </div>
                      <span className="text-zinc-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayoutShell>
  );
}
