import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
      take: 100,
    });

    return NextResponse.json({ tags });
  } catch (err: any) {
    console.error("Get tags error:", err);
    return NextResponse.json({ error: "Failed to load tags" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const trimmed = name.trim();
    const slug = slugify(trimmed);

    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name: trimmed },
      create: { name: trimmed, slug },
    });

    return NextResponse.json({ success: true, tag });
  } catch (err: any) {
    console.error("Create tag error:", err);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
