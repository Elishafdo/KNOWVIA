import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, views: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const referrer = req.headers.get("referer") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    await Promise.all([
      prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      }),
      prisma.viewLog.create({
        data: {
          articleId: article.id,
          path: `/articles/${slug}`,
          referrer,
          userAgent,
        },
      }),
    ]);

    return NextResponse.json({ success: true, views: article.views + 1 });
  } catch (err: any) {
    console.error("View increment error:", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
