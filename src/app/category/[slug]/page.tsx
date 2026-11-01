import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { title: "Category Not Found | KNOWVIA" };
  }

  return {
    title: `${category.name} | KNOWVIA`,
    description: category.description || `Articles and essays on ${category.name} from KNOWVIA.`,
  };
}

export default async function CategoryPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-10">
      {/* Category Header */}
      <div className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-sky-600 mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all categories
        </Link>

        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-sky-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Category
          </span>
        </div>

        <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif">
          {category.name}
        </h1>

        {category.description && (
          <p className="mt-3 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}

        <div className="mt-4 text-xs font-medium text-zinc-400">
          {category.articles.length} article{category.articles.length === 1 ? "" : "s"} published in this category
        </div>
      </div>

      {/* Articles Grid */}
      {category.articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {category.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-200 py-16 px-6 text-center dark:border-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            No articles in this category yet
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Check back soon for new essays and reports under {category.name}.
          </p>
          <div className="mt-6">
            <Link
              href="/articles"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Browse all articles
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
