import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const where: any = {};
  if (search) {
    where.OR = [
      { filename: { contains: search } },
      { altText: { contains: search } },
      { caption: { contains: search } },
    ];
  }

  const media = await prisma.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ media });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // If uploading via FormData
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const altText = (formData.get("altText") as string) || "";
      const caption = (formData.get("caption") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase();
      const uniqueName = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/${uniqueName}`;

      const media = await prisma.media.create({
        data: {
          filename: file.name,
          url,
          altText: altText.trim() || file.name,
          caption: caption.trim() || null,
          size: file.size,
          mimeType: file.type || "image/jpeg",
        },
      });

      return NextResponse.json({ success: true, media });
    }

    // If adding an external image URL
    const body = await req.json();
    const { url, filename, altText, caption } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const name = filename || url.split("/").pop()?.split("?")[0] || "image.jpg";

    const media = await prisma.media.create({
      data: {
        filename: name,
        url,
        altText: altText || name,
        caption: caption || null,
        mimeType: "image/jpeg",
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (err: any) {
    console.error("Media upload error:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
