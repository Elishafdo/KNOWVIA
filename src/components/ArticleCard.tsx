import React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    coverImage?: string | null;
    coverImageAlt?: string | null;
    publishedAt?: Date | string | null;
    readingTime?: number;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  variant?: "standard" | "compact" | "featured" | "discover";
}

export default function ArticleCard({ article, variant = "standard" }: ArticleCardProps) {
  const fallbackImage =
    article.coverImage ||
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="relative aspect-[16/9] lg:aspect-auto lg:col-span-7 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={fallbackImage}
            alt={article.coverImageAlt || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {article.category && (
            <div className="absolute top-4 left-4 z-10">
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-block rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-sm hover:bg-white dark:bg-zinc-900/90 dark:text-sky-300"
              >
                {article.category.name}
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {article.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
              )}
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readingTime || 3} min read
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              <Link href={`/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h2>

            {article.subtitle && (
              <p className="text-zinc-600 dark:text-zinc-300 line-clamp-3 text-sm sm:text-base leading-relaxed">
                {article.subtitle}
              </p>
            )}
          </div>

          <div className="pt-6">
            <Link
              href={`/articles/${article.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              Read Article
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "discover") {
    return (
      <article className="group flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white to-sky-50/30 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-sky-950/20">
        <div className="space-y-3">
          {article.category && (
            <Link
              href={`/category/${article.category.slug}`}
              className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 hover:underline"
            >
              {article.category.name}
            </Link>
          )}

          <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-serif group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            <Link href={`/articles/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          {article.subtitle && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {article.subtitle}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
          <span>{article.readingTime || 3} min read</span>
          <Link
            href={`/articles/${article.slug}`}
            className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 inline-flex items-center gap-1"
          >
            Explore &rarr;
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <Link href={`/articles/${article.slug}`} className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={fallbackImage}
          alt={article.coverImageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {article.category && (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-800 shadow-sm backdrop-blur-sm dark:bg-zinc-950/90 dark:text-zinc-200">
            {article.category.name}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            <span>·</span>
            <span>{article.readingTime || 3} min read</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
            <Link href={`/articles/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          {article.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {article.subtitle}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <Link
            href={`/articles/${article.slug}`}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 inline-flex items-center gap-1"
          >
            Read Article
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
