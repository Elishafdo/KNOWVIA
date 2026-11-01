import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const mapping: Record<string, string> = {
      siteName: "site_name",
      tagline: "site_tagline",
      description: "site_description",
      logoUrl: "logo_url",
      faviconUrl: "favicon_url",
      socialX: "social_x",
      socialLinkedIn: "social_linkedin",
      socialFacebook: "social_facebook",
      socialInstagram: "social_instagram",
      socialYouTube: "social_youtube",
      defaultSeoTitle: "default_seo_title",
      defaultMetaDescription: "default_meta_description",
      defaultSocialImage: "default_social_image",
      themeAccent: "theme_accent",
    };

    const operations = [];

    for (const [propKey, dbKey] of Object.entries(mapping)) {
      if (body[propKey] !== undefined) {
        operations.push(
          prisma.siteSetting.upsert({
            where: { key: dbKey },
            update: { value: String(body[propKey] || "") },
            create: {
              id: `setting_${dbKey}`,
              key: dbKey,
              value: String(body[propKey] || ""),
            },
          })
        );
      }
    }

    await Promise.all(operations);
    const updatedSettings = await getSiteSettings();

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    console.error("Save settings error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
