import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { syncScheduledArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { Compass, Sparkles, TrendingUp, BookOpen, ArrowRight } from "lucide-react";

export const revalidate = 60; // revalidate every 60 seconds

export default async function HomePage() {
  await syncScheduledArticles();

  // Fetch featured article
  let featuredArticle = await prisma.article.findFirst({
    where: { status: "PUBLISHED", isFeatured: true },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  // Fallback to latest article if no featured
  if (!featuredArticle) {
    featuredArticle = await prisma.article.findFirst({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    });
  }

  // Fetch latest articles (excluding the hero featured article)
  const latestArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      NOT: featuredArticle ? { id: featuredArticle.id } : undefined,
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  // Fetch Discover / Interesting articles
  let discoverArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED", isDiscover: true },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  if (discoverArticles.length === 0) {
    discoverArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { views: "desc" },
      take: 3,
    });
  }

  // Fetch Popular articles
  const popularArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { views: "desc" },
    take: 4,
  });

  // Fetch Categories with article counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-16 sm:space-y-24">
      {/* 1. Hero / Featured Article */}
      {featuredArticle && (
        <section aria-label="Featured Story">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <Sparkles className="h-4 w-4" />
              Editor&apos;s Featured Story
            </span>
          </div>
          <ArticleCard article={featuredArticle} variant="featured" />
        </section>
      )}

      {/* 2. Latest Articles */}
      <section aria-label="Latest Articles">
        <div className="mb-8 flex items-end justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Fresh Perspectives
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
              Latest Articles
            </h2>
          </div>
          <Link
            href="/articles"
            className="group hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-sky-600 dark:text-zinc-300 dark:hover:text-sky-400"
          >
            Browse all articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {latestArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-3 text-sm text-zinc-500">More stories coming soon.</p>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600"
          >
            Browse all articles &rarr;
          </Link>
        </div>
      </section>

      {/* 3. Explore Categories */}
      <section aria-label="Explore Categories" className="rounded-3xl bg-zinc-50/80 p-8 sm:p-12 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/80">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Curated Domains
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
            Explore Categories
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Dive into focused analyses across human thought, scientific discovery, and global changes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-700"
            >
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-sky-600 dark:text-zinc-100 dark:group-hover:text-sky-400 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span>{cat._count.articles} article{cat._count.articles === 1 ? "" : "s"}</span>
                <span className="text-sky-600 font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Interesting / Discover Section */}
      {discoverArticles.length > 0 && (
        <section aria-label="Discover Section">
          <div className="mb-6 flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-500" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Curiosities & Deep Dives
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
                Interesting Discoveries
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {discoverArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="discover" />
            ))}
          </div>
        </section>
      )}

      {/* 5. Popular / Selected Articles */}
      {popularArticles.length > 0 && (
        <section aria-label="Popular Articles">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Reader Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
                Popular on KNOWVIA
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* 6. Newsletter Subscription */}
      <Newsletter />
    </div>
  );
}
