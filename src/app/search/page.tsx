import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { Search as SearchIcon, X, SlidersHorizontal, BookOpen } from "lucide-react";

export const metadata = {
  title: "Search Articles | KNOWVIA",
  description: "Search in-depth articles across technology, science, human behavior, culture, and discoveries.",
};

export default async function SearchPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const categoryId = typeof searchParams.category === "string" ? searchParams.category : "";
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : "";

  // Build filter query
  const where: any = {
    status: "PUBLISHED",
  };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { subtitle: { contains: q } },
      { content: { contains: q } },
      { category: { name: { contains: q } } },
      { tags: { some: { tag: { name: { contains: q } } } } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (tag) {
    where.tags = {
      some: {
        tag: { name: tag },
      },
    };
  }

  const [articles, categories] = await Promise.all([
    q || categoryId || tag
      ? prisma.article.findMany({
          where,
          include: { category: true },
          orderBy: { publishedAt: "desc" },
          take: 30,
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
      {/* Search Header Form */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif">
          Search KNOWVIA
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Explore articles by keyword, subject, concepts, or categories.
        </p>

        <form action="/search" method="GET" className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by topic, keyword, or idea (e.g. artificial intelligence, memory, ocean)..."
              className="w-full rounded-2xl border border-zinc-300 bg-white pl-12 pr-4 py-3.5 text-base text-zinc-900 shadow-xs focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Quick filter pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-zinc-400 flex items-center gap-1 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter by Category:
          </span>
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className={`rounded-full px-3 py-1 font-medium ${
              !categoryId
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            All
          </Link>
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/search?q=${encodeURIComponent(q)}&category=${cat.id}`}
              className={`rounded-full px-3 py-1 font-medium ${
                categoryId === cat.id
                  ? "bg-sky-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {(q || categoryId || tag) && (
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {q ? (
              <>
                Search results for <span className="font-bold text-sky-600">&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              "Filtered articles"
            )}
            <span className="ml-2 text-sm font-normal text-zinc-500">
              ({articles.length} found)
            </span>
          </h2>

          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Link>
        </div>
      )}

      {/* Results Grid or Empty State */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : q || categoryId || tag ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 py-16 px-6 text-center dark:border-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            No articles found
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Try a different search term or remove some filters.
          </p>
          <div className="mt-6">
            <Link
              href="/articles"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-zinc-50 py-16 px-6 text-center dark:bg-zinc-900/50">
          <SearchIcon className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-3 text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Type anything into the search bar above to begin exploring
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Search titles, subtitles, concepts, and full article text.
          </p>
        </div>
      )}
    </div>
  );
}
