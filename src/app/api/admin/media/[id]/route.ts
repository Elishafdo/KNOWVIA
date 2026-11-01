import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

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
    const { altText, caption } = await req.json();

    const updated = await prisma.media.update({
      where: { id },
      data: {
        altText: altText !== undefined ? altText : undefined,
        caption: caption !== undefined ? caption : undefined,
      },
    });

    return NextResponse.json({ success: true, media: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
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
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", media.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete file from disk:", e);
        }
      }
    }

    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Media deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
