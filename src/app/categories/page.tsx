import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowRight, Layers } from "lucide-react";

export const metadata = {
  title: "Categories | KNOWVIA",
  description: "Explore all knowledge topics and domains covered on KNOWVIA.",
};

export default async function CategoriesPage() {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-10">
      <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          <Layers className="h-4 w-4" />
          Editorial Taxonomy
        </span>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif">
          All Categories
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          KNOWVIA organizes research, perspectives, and analytical writing into dedicated domains of inquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-xs transition-all hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-700"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  {category._count.articles} {category._count.articles === 1 ? "Article" : "Articles"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white font-serif group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {category.name}
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                {category.description || "Discover in-depth articles and thoughtful perspectives in this topic."}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-sky-600 group-hover:text-sky-700 dark:text-sky-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              Browse category
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
