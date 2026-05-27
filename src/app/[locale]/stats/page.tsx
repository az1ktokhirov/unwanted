import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ResultsLineChart, FormDonut } from "@/components/public/StatsCharts";
import type { Locale } from "@/types";

export async function generateMetadata() {
  return { title: "Статистика" };
}

async function getTeamStats() {
  try {
    const supabase = await createClient();
    const { data: matches } = await supabase
      .from("matches")
      .select("id, match_date, score_home, score_away, status, opponent_ru")
      .eq("status", "finished")
      .order("match_date", { ascending: true });

    if (!matches || matches.length === 0) {
      return { matches: [], agg: null, form: [], chartData: [] };
    }

    let wins = 0, draws = 0, losses = 0;
    let goalsScored = 0, goalsConceded = 0, cleanSheets = 0;

    const chartData = matches.map((m) => {
      const scored = m.score_home ?? 0;
      const conceded = m.score_away ?? 0;
      goalsScored += scored;
      goalsConceded += conceded;
      if (conceded === 0) cleanSheets++;
      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
      return {
        label: new Date(m.match_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
        scored,
        conceded,
      };
    });

    const form = matches.slice(-9).map((m) => {
      const s = m.score_home ?? 0;
      const c = m.score_away ?? 0;
      return s > c ? "W" : s === c ? "D" : "L";
    });

    return {
      matches,
      agg: { played: matches.length, wins, draws, losses, goalsScored, goalsConceded, cleanSheets },
      form,
      chartData,
    };
  } catch {
    return { matches: [], agg: null, form: [], chartData: [] };
  }
}

async function getPlayerLeaders() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("player_stats")
      .select(`
        player_id, goals, assists,
        players (name_ru, name_uz, number, photo_url, position_ru)
      `)
      .returns<Array<{
        player_id: string;
        goals: number;
        assists: number;
        players: { name_ru: string; name_uz: string; number: number | null; photo_url: string | null; position_ru: string } | null;
      }>>();

    if (!data) return { scorers: [], assisters: [] };

    const byPlayer: Record<string, { name: string; position: string; number: number | null; photo: string | null; goals: number; assists: number }> = {};
    for (const row of data) {
      if (!row.player_id) continue;
      if (!byPlayer[row.player_id]) {
        byPlayer[row.player_id] = {
          name: row.players?.name_ru ?? row.players?.name_uz ?? "—",
          position: row.players?.position_ru ?? "",
          number: row.players?.number ?? null,
          photo: row.players?.photo_url ?? null,
          goals: 0,
          assists: 0,
        };
      }
      byPlayer[row.player_id].goals += row.goals ?? 0;
      byPlayer[row.player_id].assists += row.assists ?? 0;
    }

    const players = Object.values(byPlayer);
    const scorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5);
    const assisters = [...players].sort((a, b) => b.assists - a.assists).slice(0, 5);
    return { scorers, assisters };
  } catch {
    return { scorers: [], assisters: [] };
  }
}

async function getPlayerStatsTable(locale: Locale) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("player_stats")
      .select(`
        player_id, goals, assists, yellow_cards, red_cards, minutes_played, shots_total, rating, is_starter,
        players (name_ru, name_uz, name_en, number, position_ru, position_uz, position_en)
      `)
      .returns<Array<{
        player_id: string;
        goals: number;
        assists: number;
        yellow_cards: number;
        red_cards: number;
        minutes_played: number;
        shots_total: number;
        rating: number | null;
        is_starter: boolean;
        players: { name_ru: string; name_uz: string; name_en: string; number: number | null; position_ru: string; position_uz: string; position_en: string } | null;
      }>>();

    if (!data) return [];

    const byPlayer: Record<string, any> = {};
    for (const row of data) {
      if (!row.player_id) continue;
      if (!byPlayer[row.player_id]) {
        const nameLang = `name_${locale}` as keyof typeof row.players;
        const posLang = `position_${locale}` as keyof typeof row.players;
        byPlayer[row.player_id] = {
          name: (row.players as any)?.[`name_${locale}`] ?? row.players?.name_ru ?? "—",
          position: (row.players as any)?.[`position_${locale}`] ?? row.players?.position_ru ?? "",
          number: row.players?.number ?? null,
          matches: 0, starts: 0, goals: 0, assists: 0,
          yellow: 0, red: 0, minutes: 0, shots: 0,
          ratingSum: 0, ratingCount: 0,
        };
      }
      const p = byPlayer[row.player_id];
      p.matches++;
      if (row.is_starter) p.starts++;
      p.goals += row.goals ?? 0;
      p.assists += row.assists ?? 0;
      p.yellow += row.yellow_cards ?? 0;
      p.red += row.red_cards ?? 0;
      p.minutes += row.minutes_played ?? 0;
      p.shots += row.shots_total ?? 0;
      if (row.rating != null) { p.ratingSum += row.rating; p.ratingCount++; }
    }

    return Object.values(byPlayer)
      .map((p: any) => ({
        ...p,
        avgRating: p.ratingCount > 0 ? (p.ratingSum / p.ratingCount).toFixed(1) : null,
      }))
      .sort((a: any, b: any) => b.goals - a.goals);
  } catch {
    return [];
  }
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const loc = locale as Locale;

  const [{ agg, form, chartData }, { scorers, assisters }, playerTable] = await Promise.all([
    getTeamStats(),
    getPlayerLeaders(),
    getPlayerStatsTable(loc),
  ]);

  const statWidgets = agg
    ? [
        { label: t("stats.matches"), value: agg.played, color: "text-white" },
        { label: t("stats.wins"), value: agg.wins, color: "text-win" },
        { label: t("stats.draws"), value: agg.draws, color: "text-draw" },
        { label: t("stats.losses"), value: agg.losses, color: "text-accent" },
        { label: t("stats.goalsScored"), value: agg.goalsScored, color: "text-accent2" },
        { label: t("stats.goalsConceded"), value: agg.goalsConceded, color: "text-white/60" },
        { label: t("stats.cleanSheets"), value: agg.cleanSheets, color: "text-win" },
      ]
    : [];

  return (
    <>
      {/* Hero */}
      <section className="bg-secondary border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
          <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-2">
            {t("stats.season")} 2025
          </p>
          <h1 className="font-bebas text-6xl lg:text-8xl text-white leading-none">
            {t("nav.stats").toUpperCase()}
          </h1>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Stat widgets */}
            {statWidgets.length > 0 && (
              <div>
                <h2 className="font-bebas text-2xl text-white mb-4">{t("stats.general")}</h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {statWidgets.map(({ label, value, color }) => (
                    <div key={label} className="bg-secondary rounded-xl border border-white/5 p-4 text-center">
                      <p className={`font-bebas text-3xl leading-none ${color}`}>{value}</p>
                      <p className="text-white/40 text-[9px] uppercase tracking-wider mt-1 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results chart */}
            {chartData.length > 0 && (
              <div className="bg-secondary rounded-xl border border-white/5 p-5">
                <h2 className="font-bebas text-xl text-white mb-4">{t("stats.results")}</h2>
                <ResultsLineChart
                  data={chartData}
                  scoredLabel={t("stats.goalsScored")}
                  concededLabel={t("stats.goalsConceded")}
                />
              </div>
            )}

            {/* Form strip */}
            {form.length > 0 && agg && (
              <div className="bg-secondary rounded-xl border border-white/5 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-1">
                    <h2 className="font-bebas text-xl text-white mb-3">{t("stats.form")}</h2>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {form.map((r, i) => (
                        <span
                          key={i}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black ${
                            r === "W"
                              ? "bg-win text-white"
                              : r === "D"
                              ? "bg-draw/30 text-draw"
                              : "bg-accent text-white"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/30 text-xs mt-2">Последние {form.length} матчей</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <FormDonut data={{ wins: agg.wins, draws: agg.draws, losses: agg.losses }} />
                    <p className="text-white/30 text-xs mt-1">{t("stats.winRate")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Player stats table */}
            {playerTable.length > 0 && (
              <div>
                <h2 className="font-bebas text-2xl text-white mb-4">{t("stats.players")}</h2>
                <div className="bg-secondary rounded-xl border border-white/5 overflow-x-auto">
                  <table className="w-full text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["#", "Игрок", "М", "Г", "П", "ЖК", "КК", "МИН", "Уд", "Рейт."].map((h) => (
                          <th key={h} className="px-3 py-3 text-left text-white/30 font-medium uppercase tracking-wider first:pl-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {playerTable.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3 text-white/30">{p.number ?? "—"}</td>
                          <td className="px-3 py-3">
                            <p className="text-white font-medium">{p.name}</p>
                            <p className="text-white/30 text-[10px]">{p.position}</p>
                          </td>
                          <td className="px-3 py-3 text-white/60">{p.matches}</td>
                          <td className="px-3 py-3">
                            <span className={p.goals > 0 ? "text-accent2 font-bold" : "text-white/40"}>{p.goals}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={p.assists > 0 ? "text-win font-bold" : "text-white/40"}>{p.assists}</span>
                          </td>
                          <td className="px-3 py-3">
                            {p.yellow > 0 ? (
                              <span className="inline-flex items-center justify-center w-5 h-6 bg-yellow-400 rounded-sm text-black text-[10px] font-black">{p.yellow}</span>
                            ) : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            {p.red > 0 ? (
                              <span className="inline-flex items-center justify-center w-5 h-6 bg-accent rounded-sm text-white text-[10px] font-black">{p.red}</span>
                            ) : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-3 py-3 text-white/50">{p.minutes}</td>
                          <td className="px-3 py-3 text-white/40">{p.shots}</td>
                          <td className="px-3 py-3">
                            {p.avgRating ? (
                              <span className="text-accent2 font-semibold">{p.avgRating}</span>
                            ) : <span className="text-white/20">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!agg && (
              <div className="text-center py-20 text-white/20">
                <p className="text-4xl mb-3">📊</p>
                <p>{t("stats.noStats")}</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="lg:w-60 flex-shrink-0 space-y-5">
            {/* Top scorers */}
            {scorers.length > 0 && (
              <div className="bg-secondary rounded-xl border border-white/5 p-4">
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">
                  {t("stats.topScorers")}
                </h3>
                <div className="space-y-2">
                  {scorers.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-white/20 text-[10px] w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                        <p className="text-white/30 text-[10px]">{p.position}</p>
                      </div>
                      <span className="font-bebas text-xl text-accent2 leading-none">{p.goals}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top assisters */}
            {assisters.filter((p: any) => p.assists > 0).length > 0 && (
              <div className="bg-secondary rounded-xl border border-white/5 p-4">
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">
                  {t("stats.topAssists")}
                </h3>
                <div className="space-y-2">
                  {assisters.filter((p: any) => p.assists > 0).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-white/20 text-[10px] w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                        <p className="text-white/30 text-[10px]">{p.position}</p>
                      </div>
                      <span className="font-bebas text-xl text-win leading-none">{p.assists}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season overview */}
            {agg && (
              <div className="bg-secondary rounded-xl border border-white/5 p-4">
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">
                  Командные показатели
                </h3>
                {[
                  { label: t("stats.goalsScored"), value: agg.goalsScored, max: Math.max(agg.goalsScored, 1), color: "bg-accent2" },
                  { label: t("stats.goalsConceded"), value: agg.goalsConceded, max: Math.max(agg.goalsScored, 1), color: "bg-accent" },
                  { label: t("stats.cleanSheets"), value: agg.cleanSheets, max: Math.max(agg.played, 1), color: "bg-win" },
                ].map(({ label, value, max, color }) => (
                  <div key={label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">{label}</span>
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: `${Math.round((value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
