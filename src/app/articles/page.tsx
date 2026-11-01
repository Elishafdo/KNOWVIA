import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { syncScheduledArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { Search, Filter, BookOpen } from "lucide-react";

export const metadata = {
  title: "All Articles | KNOWVIA",
  description: "Browse all articles, essays, and deep-dive discoveries on KNOWVIA.",
};

export default async function ArticlesPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  await syncScheduledArticles();

  const searchParams = await props.searchParams;
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const sortBy = typeof searchParams.sort === "string" ? searchParams.sort : "latest";
  const page = parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10);
  const limit = 9;
  const skip = (page - 1) * limit;

  // Filter conditions
  const where: any = { status: "PUBLISHED" };
  if (categorySlug && categorySlug !== "all") {
    where.category = { slug: categorySlug };
  }

  let orderBy: any = { publishedAt: "desc" };
  if (sortBy === "popular") {
    orderBy = { views: "desc" };
  } else if (sortBy === "oldest") {
    orderBy = { publishedAt: "asc" };
  }

  const [articles, totalCount, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif">
          All Articles
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          In-depth explorations across technology, science, human behavior, culture, and discoveries.
        </p>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          <Link
            href="/articles"
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !categorySlug || categorySlug === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            All Topics
          </Link>
          {categories.map((cat) => {
            const isActive = categorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}&sort=${sortBy}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-zinc-500 font-medium">Sort:</span>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
            <Link
              href={`/articles?${categorySlug ? `category=${categorySlug}&` : ""}sort=latest`}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === "latest"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Latest
            </Link>
            <Link
              href={`/articles?${categorySlug ? `category=${categorySlug}&` : ""}sort=popular`}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === "popular"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Popular
            </Link>
            <Link
              href={`/articles?${categorySlug ? `category=${categorySlug}&` : ""}sort=oldest`}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === "oldest"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Oldest
            </Link>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-200 py-16 px-6 text-center dark:border-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            No articles found
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            There are currently no published articles matching this filter.
          </p>
          <div className="mt-6">
            <Link
              href="/articles"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Reset Filters
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === page;
            const params = new URLSearchParams();
            if (categorySlug) params.set("category", categorySlug);
            if (sortBy) params.set("sort", sortBy);
            params.set("page", String(pageNum));

            return (
              <Link
                key={pageNum}
                href={`/articles?${params.toString()}`}
                className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  isCurrent
                    ? "bg-sky-600 text-white shadow-xs"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
