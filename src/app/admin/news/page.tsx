import { adminSupabase } from "@/lib/supabase/admin";
import NewsClient from "./NewsClient";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  let news = null;
  try {
    ({ data: news } = await adminSupabase
      .from("news")
      .select("id, title_ru, cover_url, status, category, published_at, views, slug, tags, excerpt_ru")
      .order("created_at", { ascending: false }));
  } catch { /* Supabase unavailable */ }

  return <NewsClient initialNews={news ?? []} />;
}
