import { MetadataRoute } from "next";
import { adminSupabase } from "@/lib/supabase/admin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://unwantedboys.uz";
const LOCALES = ["uz", "ru", "en"];

function localizedUrls(path: string, priority: number, freq: MetadataRoute.Sitemap[0]["changeFrequency"]) {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: news }, { data: players }] = await Promise.all([
    adminSupabase.from("news").select("slug, published_at").eq("status", "published"),
    adminSupabase.from("players").select("id, created_at").eq("is_active", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    ...localizedUrls("", 1.0, "daily"),
    ...localizedUrls("/matches", 0.9, "daily"),
    ...localizedUrls("/team", 0.8, "weekly"),
    ...localizedUrls("/stats", 0.7, "weekly"),
    ...localizedUrls("/news", 0.8, "daily"),
    ...localizedUrls("/media", 0.7, "weekly"),
    ...localizedUrls("/club", 0.6, "monthly"),
  ];

  const newsPages: MetadataRoute.Sitemap = (news ?? []).flatMap((n) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/news/${n.slug}`,
      lastModified: n.published_at ? new Date(n.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const playerPages: MetadataRoute.Sitemap = (players ?? []).flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/team/${p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))
  );

  return [...staticPages, ...newsPages, ...playerPages];
}
