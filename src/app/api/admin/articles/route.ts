import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify, calculateReadingTime } from "@/lib/utils";
import { syncScheduledArticles } from "@/lib/articles";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncScheduledArticles();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { subtitle: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      slug: customSlug,
      content,
      coverImage,
      coverImageAlt,
      categoryId,
      status = "DRAFT",
      scheduledAt,
      seoTitle,
      metaDescription,
      isFeatured = false,
      isDiscover = false,
      keyTakeaways,
      tags = [], // array of string names or objects
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    let slug = slugify(customSlug || title);
    if (!slug) slug = `article-${Date.now()}`;

    // Ensure slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const readingTime = calculateReadingTime(content || "");

    let publishedAt: Date | null = null;
    let scheduledDate: Date | null = null;

    if (status === "PUBLISHED") {
      publishedAt = new Date();
    } else if (status === "SCHEDULED" && scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        publishedAt = new Date();
      }
    }

    const finalStatus =
      status === "SCHEDULED" && scheduledDate && scheduledDate <= new Date()
        ? "PUBLISHED"
        : status;

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        slug,
        content: content || "",
        coverImage: coverImage || null,
        coverImageAlt: coverImageAlt || null,
        categoryId,
        status: finalStatus,
        publishedAt: finalStatus === "PUBLISHED" ? publishedAt || new Date() : null,
        scheduledAt: scheduledDate,
        seoTitle: seoTitle || title.trim(),
        metaDescription: metaDescription || subtitle || null,
        readingTime,
        isFeatured: Boolean(isFeatured),
        isDiscover: Boolean(isDiscover),
        keyTakeaways: typeof keyTakeaways === "string" ? keyTakeaways : JSON.stringify(keyTakeaways || []),
      },
    });

    // Handle tags
    if (Array.isArray(tags) && tags.length > 0) {
      for (const rawTag of tags) {
        const tagName = typeof rawTag === "string" ? rawTag.trim() : rawTag.name?.trim();
        if (!tagName) continue;
        const tagSlug = slugify(tagName);

        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: { name: tagName },
          create: { name: tagName, slug: tagSlug },
        });

        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        }).catch(() => {});
      }
    }

    const fullArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ success: true, article: fullArticle });
  } catch (err: any) {
    console.error("Create article error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create article" },
      { status: 500 }
    );
  }
}
