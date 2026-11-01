import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify, calculateReadingTime } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

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
      status,
      scheduledAt,
      seoTitle,
      metaDescription,
      isFeatured,
      isDiscover,
      keyTakeaways,
      tags = [],
    } = body;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let finalSlug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      finalSlug = slugify(customSlug);
      const duplicate = await prisma.article.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (duplicate) {
        finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const readingTime = calculateReadingTime(content ?? existing.content);

    let publishedAt = existing.publishedAt;
    let scheduledDate: Date | null = null;
    let finalStatus = status || existing.status;

    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      publishedAt = new Date();
    } else if (status === "SCHEDULED" && scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        finalStatus = "PUBLISHED";
        publishedAt = new Date();
      }
    } else if (status === "DRAFT") {
      // Keep or nullify publishedAt if unpublishing
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        subtitle: subtitle !== undefined ? subtitle?.trim() : existing.subtitle,
        slug: finalSlug,
        content: content !== undefined ? content : existing.content,
        coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
        coverImageAlt: coverImageAlt !== undefined ? coverImageAlt : existing.coverImageAlt,
        categoryId: categoryId || existing.categoryId,
        status: finalStatus,
        publishedAt,
        scheduledAt: scheduledDate,
        seoTitle: seoTitle !== undefined ? seoTitle : existing.seoTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        readingTime,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        isDiscover: isDiscover !== undefined ? Boolean(isDiscover) : existing.isDiscover,
        keyTakeaways:
          keyTakeaways !== undefined
            ? typeof keyTakeaways === "string"
              ? keyTakeaways
              : JSON.stringify(keyTakeaways)
            : existing.keyTakeaways,
      },
    });

    // Update tags
    if (Array.isArray(tags)) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });

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
            articleId: id,
            tagId: tag.id,
          },
        }).catch(() => {});
      }
    }

    const refreshed = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ success: true, article: refreshed });
  } catch (err: any) {
    console.error("Update article error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

  try {
    // Delete article and its relations
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Article deleted successfully" });
  } catch (err: any) {
    console.error("Delete article error:", err);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
