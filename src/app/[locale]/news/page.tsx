import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import NewsFilters from "@/components/public/NewsFilters";
import type { News } from "@/types";
import type { Locale } from "@/types";

export async function generateMetadata() {
  return { title: "Новости" };
}

async function getNews(): Promise<News[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    return (data ?? []) as News[];
  } catch {
    return [];
  }
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const news = await getNews();
  const loc = locale as Locale;

  const labels: Record<string, string> = {
    all: t("news.all"),
    announcements: t("news.announcements"),
    match: t("news.match"),
    interview: t("news.interview"),
    club: t("news.club"),
    media: t("news.media"),
    tournament: t("news.tournament"),
    search: t("news.search"),
    noNews: t("news.noNews"),
    newsOfDay: t("news.newsOfDay"),
    latest: t("news.latest"),
    popular: t("news.popular"),
    readMore: t("news.readMore"),
  };

  return (
    <>
      <section className="bg-secondary border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
          <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-2">
            {t("news.latest")}
          </p>
          <h1 className="font-bebas text-6xl lg:text-8xl text-white leading-none">
            {t("nav.news").toUpperCase()}
          </h1>
          <p className="text-white/40 text-sm mt-2">{news.length} {t("news.all").toLowerCase()}</p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <NewsFilters news={news} locale={loc} labels={labels} />
      </section>
    </>
  );
}
