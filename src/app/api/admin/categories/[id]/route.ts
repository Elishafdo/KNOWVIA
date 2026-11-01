import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

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
    const { name, slug: customSlug, description, image } = await req.json();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      slug = slugify(customSlug);
      const duplicate = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Slug already in use by another category" }, { status: 400 });
      }
    } else if (name && name !== existing.name && !customSlug) {
      slug = slugify(name);
      const duplicate = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (!duplicate) {
        // updated
      } else {
        slug = existing.slug;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        slug,
        description: description !== undefined ? description?.trim() : existing.description,
        image: image !== undefined ? image : existing.image,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    console.error("Update category error:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    const articlesCount = await prisma.article.count({ where: { categoryId: id } });
    if (articlesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${articlesCount} article(s) are assigned to it. Please reassign or delete them first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (err: any) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
