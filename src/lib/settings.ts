import prisma from "./prisma";

export interface SiteSettingsData {
  siteName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  socialX?: string;
  socialLinkedIn?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYouTube?: string;
  defaultSeoTitle?: string;
  defaultMetaDescription?: string;
  defaultSocialImage?: string;
  themeAccent?: string;
}

export const defaultSettings: SiteSettingsData = {
  siteName: "KNOWVIA",
  tagline: "Discover. Learn. Understand.",
  description:
    "A modern editorial knowledge publication exploring breakthroughs in AI, science, psychology, society, culture, and the ideas shaping our world.",
  socialX: "https://x.com/knowvia",
  socialLinkedIn: "https://linkedin.com/company/knowvia",
  socialFacebook: "",
  socialInstagram: "",
  socialYouTube: "",
  defaultSeoTitle: "KNOWVIA — Discover. Learn. Understand.",
  defaultMetaDescription:
    "Curated knowledge and deep-dive articles on AI, science, psychology, world developments, and modern culture.",
  themeAccent: "#0284c7",
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const records = await prisma.siteSetting.findMany();
    const map = new Map<string, string>();
    for (const r of records) {
      map.set(r.key, r.value);
    }

    return {
      siteName: map.get("site_name") || defaultSettings.siteName,
      tagline: map.get("site_tagline") || defaultSettings.tagline,
      description: map.get("site_description") || defaultSettings.description,
      logoUrl: map.get("logo_url") || undefined,
      faviconUrl: map.get("favicon_url") || undefined,
      socialX: map.get("social_x") || defaultSettings.socialX,
      socialLinkedIn: map.get("social_linkedin") || defaultSettings.socialLinkedIn,
      socialFacebook: map.get("social_facebook") || "",
      socialInstagram: map.get("social_instagram") || "",
      socialYouTube: map.get("social_youtube") || "",
      defaultSeoTitle: map.get("default_seo_title") || defaultSettings.defaultSeoTitle,
      defaultMetaDescription: map.get("default_meta_description") || defaultSettings.defaultMetaDescription,
      defaultSocialImage: map.get("default_social_image") || undefined,
      themeAccent: map.get("theme_accent") || defaultSettings.themeAccent,
    };
  } catch (err) {
    console.error("Failed to fetch settings from DB, using defaults:", err);
    return defaultSettings;
  }
}
