import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import MatchesClient from "@/components/public/MatchesClient";
import type { Match } from "@/types";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titles: Record<string, string> = { uz: "O'yinlar", ru: "Матчи", en: "Matches" };
  const descs: Record<string, string> = {
    uz: "Unwanted Boys FC barcha o'yinlari, natijalar va jadvallar",
    ru: "Все матчи Unwanted Boys FC — результаты, расписание, статистика",
    en: "All Unwanted Boys FC matches — results, schedule, statistics",
  };
  return {
    title: titles[locale] ?? "Матчи",
    description: descs[locale],
    openGraph: { title: titles[locale], description: descs[locale] },
  };
}

async function getMatches(): Promise<{ upcoming: Match[]; previous: Match[] }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("matches")
      .select("*")
      .neq("status", "draft")
      .order("match_date", { ascending: false });

    const all = (data ?? []) as Match[];
    const upcoming = all.filter((m) => m.status === "upcoming" || m.status === "live").reverse();
    const previous = all.filter((m) => m.status === "finished");
    return { upcoming, previous };
  } catch {
    return { upcoming: [], previous: [] };
  }
}

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const { upcoming, previous } = await getMatches();
  const loc = locale as Locale;

  const labels: Record<string, string> = {
    upcoming: t("match.upcoming"),
    previous: t("match.previous"),
    noMatches: t("match.noMatches"),
    selectMatch: t("match.selectMatch"),
    overview: t("match.overview"),
    matchStats: t("match.matchStats"),
    lineups: t("match.lineups"),
    timeline: t("match.timeline"),
    h2h: t("match.h2h"),
    watchHighlight: t("match.watchHighlight"),
    goal: t("match.goal"),
    yellowCard: t("match.yellowCard"),
    redCard: t("match.redCard"),
    substitution: t("match.substitution"),
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-secondary border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
          <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-2">
            Сезон 2025
          </p>
          <h1 className="font-bebas text-6xl lg:text-8xl text-white leading-none">
            {t("nav.matches").toUpperCase()}
          </h1>
          <div className="flex items-center gap-6 mt-3 text-white/40 text-sm">
            <span>{upcoming.length} предстоящих</span>
            <span>·</span>
            <span>{previous.length} сыграно</span>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <MatchesClient
          upcomingMatches={upcoming}
          previousMatches={previous}
          locale={loc}
          labels={labels}
        />
      </section>
    </>
  );
}
