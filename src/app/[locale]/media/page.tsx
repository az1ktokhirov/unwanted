import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import MediaGrid from "@/components/public/MediaGrid";
import type { Media } from "@/types";
import type { Locale } from "@/types";

export async function generateMetadata() {
  return { title: "Медиа" };
}

async function getVideos(): Promise<Media[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(60);
    return (data ?? []) as Media[];
  } catch {
    return [];
  }
}

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const videos = await getVideos();
  const loc = locale as Locale;

  const labels: Record<string, string> = {
    all: t("media.all"),
    matches: t("media.matches"),
    vlogs: t("media.vlogs"),
    behindScenes: t("media.behindScenes"),
    shorts: t("media.shorts"),
    training: t("media.training"),
    interview: t("media.interview"),
    highlight: t("media.highlight"),
    search: t("common.search"),
    noVideos: t("media.noVideos"),
    newVideos: t("media.newVideos"),
    allVideos: t("media.allVideos"),
    featured: t("media.featured"),
    watchOnYoutube: t("media.watchOnYoutube"),
  };

  return (
    <>
      <section className="bg-secondary border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
          <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-2">
            {t("media.newVideos")}
          </p>
          <h1 className="font-bebas text-6xl lg:text-8xl text-white leading-none">
            {t("nav.media").toUpperCase()}
          </h1>
          <p className="text-white/40 text-sm mt-2">{videos.length} {t("media.allVideos").toLowerCase()}</p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <MediaGrid videos={videos} locale={loc} labels={labels} />
      </section>
    </>
  );
}
