import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import ArticleRenderer from "@/components/ArticleRenderer";
import ShareButtons from "@/components/ShareButtons";
import ViewTracker from "@/components/ViewTracker";
import ArticleCard from "@/components/ArticleCard";
import { Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!article) {
    return { title: "Article Not Found | KNOWVIA" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knowvia.com";
  const title = article.seoTitle || `${article.title} | KNOWVIA`;
  const description = article.metaDescription || article.subtitle || "A KNOWVIA publication.";
  const canonicalUrl = `${siteUrl}/articles/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      images: article.coverImage ? [{ url: article.coverImage, alt: article.coverImageAlt || article.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticlePage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article || (article.status !== "PUBLISHED")) {
    notFound();
  }

  // Related articles (same category or shared tags)
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: article.categoryId,
      NOT: { id: article.id },
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Previous and Next articles
  const [prevArticle, nextArticle] = await Promise.all([
    prisma.article.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          lt: article.publishedAt || new Date(),
        },
      },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          gt: article.publishedAt || new Date(0),
        },
      },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  // Parse Key Takeaways if any
  let keyTakeawaysList: string[] = [];
  if (article.keyTakeaways) {
    try {
      const parsed = JSON.parse(article.keyTakeaways);
      if (Array.isArray(parsed)) {
        keyTakeawaysList = parsed.filter(Boolean);
      } else if (typeof parsed === "string") {
        keyTakeawaysList = [parsed];
      }
    } catch {
      // Split by newlines if plain text
      keyTakeawaysList = article.keyTakeaways
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]+\s*/, "").trim())
        .filter(Boolean);
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knowvia.com";
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      {/* Background view logger */}
      <ViewTracker slug={article.slug} />

      {/* Header section */}
      <header className="space-y-6 text-center sm:text-left">
        {article.category && (
          <div>
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 transition-colors"
            >
              {article.category.name}
            </Link>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
            {article.subtitle}
          </p>
        )}

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 border-y border-zinc-200 py-3.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {article.publishedAt && (
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 text-zinc-400" />
              Published on {formatDate(article.publishedAt)}
            </span>
          )}
          <span>·</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="h-4 w-4 text-zinc-400" />
            {article.readingTime || 3} min read
          </span>
          {article.views > 0 && (
            <>
              <span>·</span>
              <span className="font-medium text-zinc-500">{article.views.toLocaleString()} views</span>
            </>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <figure className="my-8 sm:my-10">
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 shadow-md dark:border-zinc-800">
            <img
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              className="w-full max-h-[540px] object-cover"
            />
          </div>
          {article.coverImageCaption && (
            <figcaption className="mt-2 text-center text-xs text-zinc-400 italic">
              {article.coverImageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Body Content */}
      <div className="mx-auto max-w-3xl pt-2">
        <ArticleRenderer content={article.content} />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" />
              Tags:
            </span>
            {article.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/search?q=${encodeURIComponent(tag.name)}`}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Key Takeaways */}
        {keyTakeawaysList.length > 0 && (
          <section aria-label="Key Takeaways" className="my-10 rounded-2xl border border-sky-100 bg-sky-50/70 p-6 sm:p-8 dark:border-sky-900/60 dark:bg-sky-950/20">
            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 mb-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <h3 className="text-lg font-bold font-serif">Key Takeaways</h3>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {keyTakeawaysList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Share Article section */}
        <div className="my-10 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <ShareButtons title={article.title} url={articleUrl} />
        </div>

        {/* Previous / Next Article Navigation */}
        <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-zinc-200 py-6 dark:border-zinc-800">
          {prevArticle ? (
            <Link
              href={`/articles/${prevArticle.slug}`}
              className="group flex flex-col rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-sky-600">
                <ChevronLeft className="h-4 w-4" />
                Previous Article
              </span>
              <span className="mt-1 font-serif text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-sky-600">
                {prevArticle.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextArticle ? (
            <Link
              href={`/articles/${nextArticle.slug}`}
              className="group flex flex-col items-start sm:items-end text-left sm:text-right rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-sky-600">
                Next Article
                <ChevronRight className="h-4 w-4" />
              </span>
              <span className="mt-1 font-serif text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-sky-600">
                {nextArticle.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section aria-label="Related Articles" className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
          <h2 className="mb-6 text-2xl font-bold font-serif text-zinc-900 dark:text-white">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {relatedArticles.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
