"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckCircle,
  FileEdit,
  Calendar,
  Layers,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import KnowviaLogo from "../KnowviaLogo";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [articlesExpanded, setArticlesExpanded] = useState(true);

  const isArticlesActive = pathname.startsWith("/admin/articles");

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-200 bg-zinc-900 text-zinc-300 dark:border-zinc-800 flex flex-col justify-between min-h-screen">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <KnowviaLogo size="sm" inverted={true} href="/admin" />
            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-400 uppercase">
              CMS
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5 text-sm font-medium">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              pathname === "/admin"
                ? "bg-sky-600 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {/* Articles Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setArticlesExpanded(!articlesExpanded)}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                isArticlesActive
                  ? "text-white font-semibold bg-zinc-800/80"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span>Articles</span>
              </div>
              {articlesExpanded ? (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              )}
            </button>

            {articlesExpanded && (
              <div className="mt-1 ml-6 space-y-1 pl-3 border-l border-zinc-800 text-xs">
                <Link
                  href="/admin/articles"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    pathname === "/admin/articles"
                      ? "text-sky-400 font-semibold bg-zinc-800"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>All Articles</span>
                </Link>
                <Link
                  href="/admin/articles/new"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    pathname === "/admin/articles/new"
                      ? "text-sky-400 font-semibold bg-zinc-800"
                      : "text-emerald-400 font-medium hover:text-emerald-300"
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ New Article</span>
                </Link>
                <Link
                  href="/admin/articles?status=PUBLISHED"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Published</span>
                </Link>
                <Link
                  href="/admin/articles?status=DRAFT"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <FileEdit className="h-3.5 w-3.5 text-amber-500" />
                  <span>Drafts</span>
                </Link>
                <Link
                  href="/admin/articles?status=SCHEDULED"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5 text-sky-400" />
                  <span>Scheduled</span>
                </Link>
              </div>
            )}
          </div>

          {/* Categories */}
          <Link
            href="/admin/categories"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              pathname.startsWith("/admin/categories")
                ? "bg-sky-600 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Categories</span>
          </Link>

          {/* Media Library */}
          <Link
            href="/admin/media"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              pathname.startsWith("/admin/media")
                ? "bg-sky-600 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Media Library</span>
          </Link>

          {/* Analytics */}
          <Link
            href="/admin/analytics"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              pathname.startsWith("/admin/analytics")
                ? "bg-sky-600 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Link>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
              pathname.startsWith("/admin/settings")
                ? "bg-sky-600 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Footer link to public website */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            View Live Site
          </span>
          <span className="text-[10px] text-zinc-600">↗</span>
        </Link>
      </div>
    </aside>
  );
}
