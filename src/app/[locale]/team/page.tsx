import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import TeamFilters from "@/components/public/TeamFilters";
import type { Player } from "@/types";
import type { Locale } from "@/types";

export async function generateMetadata() {
  return { title: "Команда" };
}

async function getPlayers(): Promise<Player[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("is_active", true)
      .order("number", { ascending: true, nullsFirst: false });
    return data ?? [];
  } catch {
    return [];
  }
}

async function getSeasonStats() {
  try {
    const supabase = await createClient();
    const { data: matches } = await supabase
      .from("matches")
      .select("score_home, score_away, status")
      .eq("status", "finished");

    if (!matches) return { played: 0, won: 0, drawn: 0, lost: 0, goals: 0 };

    return matches.reduce(
      (acc, m) => {
        if (m.score_home == null) return acc;
        acc.played++;
        acc.goals += m.score_home;
        if (m.score_home > m.score_away) acc.won++;
        else if (m.score_home === m.score_away) acc.drawn++;
        else acc.lost++;
        return acc;
      },
      { played: 0, won: 0, drawn: 0, lost: 0, goals: 0 }
    );
  } catch {
    return { played: 0, won: 0, drawn: 0, lost: 0, goals: 0 };
  }
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const [players, seasonStats] = await Promise.all([getPlayers(), getSeasonStats()]);

  const loc = locale as Locale;

  const gkCount = players.filter((p) => {
    const pos = (p[`position_${loc}`] || p.position_uz).toLowerCase();
    return pos.includes("darvozabon") || pos.includes("вратарь") || pos.includes("goalkeeper");
  }).length;

  const fieldCount = players.filter((p) => {
    const pos = (p[`position_${loc}`] || p.position_uz).toLowerCase();
    return !pos.includes("darvozabon") && !pos.includes("вратарь") && !pos.includes("goalkeeper");
  }).length;

  const filterLabels = {
    squad: t("player.players"),
    coaches: t("player.coaches"),
    medical: t("player.medical"),
    all: t("player.all"),
    gk: t("player.goalkeeper"),
    def: t("player.defender"),
    mid: t("player.midfielder"),
    fwd: t("player.forward"),
    byNumber: t("player.byNumber"),
    noPlayers: t("common.noData"),
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('/images/team-hero.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 lg:px-8 py-20">
          <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-2">
            {new Date().getFullYear()} / 2025
          </p>
          <h1 className="font-bebas text-6xl lg:text-8xl text-white leading-none mb-4">
            {t("nav.team").toUpperCase()}
          </h1>
          <p className="text-white/50 text-sm max-w-md">
            Unwanted Boys — {players.length} {t("player.players").toLowerCase()}
          </p>
        </div>
      </section>

      {/* Club stats strip */}
      <section className="bg-secondary border-y border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t("player.players"), value: players.length },
              { label: "GK", value: gkCount },
              { label: t("stats.matches"), value: seasonStats.played },
              { label: t("stats.goals"), value: seasonStats.goals },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-bebas text-4xl text-white">{value}</p>
                <p className="text-white/40 text-xs tracking-widest uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Player grid */}
          <div className="flex-1 min-w-0">
            <TeamFilters players={players} locale={loc} labels={filterLabels} />
          </div>

          {/* Right sidebar */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Season summary */}
            <div className="bg-secondary rounded-xl border border-white/5 p-5">
              <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-4">
                Сезон 2025
              </h3>
              <div className="space-y-3">
                {[
                  { label: t("stats.matches"), value: seasonStats.played, color: "text-white" },
                  { label: t("match.win"), value: seasonStats.won, color: "text-win" },
                  { label: t("match.draw"), value: seasonStats.drawn, color: "text-draw" },
                  { label: t("match.loss"), value: seasonStats.lost, color: "text-accent" },
                  { label: t("stats.goals"), value: seasonStats.goals, color: "text-accent2" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">{label}</span>
                    <span className={`font-bebas text-xl leading-none ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About club card */}
            <div className="bg-secondary rounded-xl border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs font-black">UB</span>
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-none">UNWANTED</p>
                  <p className="text-accent text-[10px] font-bold leading-none">BOYS</p>
                </div>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Самый популярный медиафутбольный клуб Узбекистана. Основан в 2022 году.
                Страсть. Характер. Движение.
              </p>
              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-white font-bebas text-xl">2022</p>
                  <p className="text-white/30 text-[10px]">Основан</p>
                </div>
                <div>
                  <p className="text-white font-bebas text-xl">400K+</p>
                  <p className="text-white/30 text-[10px]">YouTube</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
