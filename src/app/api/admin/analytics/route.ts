import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      categoriesCount,
      allArticlesViews,
      topArticles,
      recentViews,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "SCHEDULED" } }),
      prisma.category.count(),
      prisma.article.aggregate({
        _sum: {
          views: true,
        },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
        orderBy: { views: "desc" },
        take: 7,
      }),
      prisma.viewLog.findMany({
        select: {
          id: true,
          path: true,
          createdAt: true,
          article: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const totalViews = allArticlesViews._sum.views || 0;

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      categoriesCount,
      totalViews,
      topArticles,
      recentViews,
      isExternalProviderConnected: false,
      connectedProviderName: null,
    });
  } catch (err: any) {
    console.error("Analytics fetch error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
