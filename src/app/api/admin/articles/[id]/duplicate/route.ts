import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

  try {
    const original = await prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const copySlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;

    const duplicate = await prisma.article.create({
      data: {
        title: `${original.title} (Copy)`,
        subtitle: original.subtitle,
        slug: copySlug,
        content: original.content,
        coverImage: original.coverImage,
        coverImageAlt: original.coverImageAlt,
        categoryId: original.categoryId,
        status: "DRAFT",
        publishedAt: null,
        scheduledAt: null,
        seoTitle: original.seoTitle ? `${original.seoTitle} (Copy)` : null,
        metaDescription: original.metaDescription,
        readingTime: original.readingTime,
        views: 0,
        isFeatured: false,
        isDiscover: false,
        keyTakeaways: original.keyTakeaways,
      },
    });

    for (const tagRel of original.tags) {
      await prisma.articleTag.create({
        data: {
          articleId: duplicate.id,
          tagId: tagRel.tagId,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, article: duplicate });
  } catch (err: any) {
    console.error("Duplicate article error:", err);
    return NextResponse.json(
      { error: "Failed to duplicate article" },
      { status: 500 }
    );
  }
}
