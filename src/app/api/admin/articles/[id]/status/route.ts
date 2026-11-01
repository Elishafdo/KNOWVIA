import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;

  try {
    const { status } = await req.json();

    if (!["PUBLISHED", "DRAFT", "SCHEDULED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updateData: any = { status };
    if (status === "PUBLISHED" && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (err: any) {
    console.error("Status update error:", err);
    return NextResponse.json(
      { error: "Failed to update article status" },
      { status: 500 }
    );
  }
}
