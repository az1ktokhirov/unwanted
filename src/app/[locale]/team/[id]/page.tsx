import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import type { Player, PlayerStats } from "@/types";
import type { Locale } from "@/types";

function calcAge(birthdate: string | null) {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

async function getPlayer(id: string): Promise<Player | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();
    return data;
  } catch {
    return null;
  }
}

async function getAggregatedStats(playerId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("player_stats")
      .select("goals, assists, yellow_cards, red_cards, minutes_played, shots_total, shots_on_target, rating, is_starter")
      .eq("player_id", playerId);

    if (!data || data.length === 0) {
      return { matches: 0, starts: 0, goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0, shots: 0, shotsOn: 0, avgRating: null };
    }

    const agg = data.reduce(
      (acc, s) => ({
        matches: acc.matches + 1,
        starts: acc.starts + (s.is_starter ? 1 : 0),
        goals: acc.goals + (s.goals ?? 0),
        assists: acc.assists + (s.assists ?? 0),
        yellow: acc.yellow + (s.yellow_cards ?? 0),
        red: acc.red + (s.red_cards ?? 0),
        minutes: acc.minutes + (s.minutes_played ?? 0),
        shots: acc.shots + (s.shots_total ?? 0),
        shotsOn: acc.shotsOn + (s.shots_on_target ?? 0),
        ratingSum: acc.ratingSum + (s.rating ?? 0),
        ratingCount: acc.ratingCount + (s.rating != null ? 1 : 0),
      }),
      { matches: 0, starts: 0, goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0, shots: 0, shotsOn: 0, ratingSum: 0, ratingCount: 0 }
    );

    return {
      ...agg,
      avgRating: agg.ratingCount > 0 ? (agg.ratingSum / agg.ratingCount).toFixed(1) : null,
    };
  } catch {
    return { matches: 0, starts: 0, goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0, shots: 0, shotsOn: 0, avgRating: null };
  }
}

async function getRecentMatches(playerId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("player_stats")
      .select(`
        goals, assists, yellow_cards, red_cards, minutes_played, rating, is_starter,
        matches (id, opponent_uz, opponent_ru, opponent_en, match_date, score_home, score_away, competition_ru, opponent_logo_url)
      `)
      .eq("player_id", playerId)
      .order("matches(match_date)", { ascending: false })
      .limit(8);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const player = await getPlayer(id);
  if (!player) return { title: "Игрок не найден" };
  const name = (player as any)[`name_${locale}`] || player.name_ru;
  const pos = (player as any)[`position_${locale}`] || player.position_ru;
  const desc = `${name} — ${pos} Unwanted Boys FC`;
  return {
    title: name,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
      images: player.photo_url ? [{ url: player.photo_url, width: 400, height: 600 }] : [],
    },
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations();
  const loc = locale as Locale;

  const [player, stats, recentMatches] = await Promise.all([
    getPlayer(id),
    getAggregatedStats(id),
    getRecentMatches(id),
  ]);

  if (!player) notFound();

  const name = player[`name_${loc}`] || player.name_uz;
  const position = player[`position_${loc}`] || player.position_uz;
  const bio = player[`bio_${loc}`] || player.bio_ru;
  const age = calcAge(player.birthdate);

  const statusColors: Record<string, string> = {
    active: "bg-win/20 text-win",
    reserve: "bg-yellow-500/20 text-yellow-400",
    injured: "bg-accent/20 text-accent",
    inactive: "bg-white/10 text-white/40",
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-secondary border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-xs mb-6 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("nav.team")}
          </Link>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="relative w-40 h-48 rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-white/10">
              {player.photo_url ? (
                <Image
                  src={player.photo_url}
                  alt={name}
                  fill
                  className="object-cover object-top"
                  sizes="160px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-bebas text-6xl text-white/10">{player.number ?? "?"}</span>
                </div>
              )}
              {player.number != null && (
                <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-sm font-black">{player.number}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors[player.status] ?? "bg-white/10 text-white/40"}`}>
                  {t(`player.${player.status}`)}
                </span>
                <span className="text-white/30 text-xs">{position}</span>
              </div>
              <h1 className="font-bebas text-5xl lg:text-6xl text-white leading-none mb-4">{name.toUpperCase()}</h1>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: "Возраст", value: age ? `${age} лет` : "—" },
                  { label: "Дата рождения", value: formatDate(player.birthdate) },
                  { label: "Рост", value: player.height_cm ? `${player.height_cm} см` : "—" },
                  { label: "Вес", value: player.weight_kg ? `${player.weight_kg} кг` : "—" },
                  { label: "Нога", value: player.dominant_foot ?? "—" },
                  { label: "Нац.", value: player.nationality },
                  { label: "В клубе с", value: formatDate(player.joined_date) },
                  { label: "Контракт до", value: formatDate(player.contract_until) },
                ]
                  .filter(({ value }) => value !== "—")
                  .map(({ label, value }) => (
                    <div key={label} className="bg-primary/50 rounded-lg px-3 py-2">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">{label}</p>
                      <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Season stats */}
            <div>
              <h2 className="font-bebas text-2xl text-white mb-4">СТАТИСТИКА СЕЗОНА</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: t("stats.matches"), value: stats.matches, color: "text-white" },
                  { label: t("stats.goals"), value: stats.goals, color: "text-accent2" },
                  { label: t("stats.assists"), value: stats.assists, color: "text-win" },
                  { label: t("stats.yellowCards"), value: stats.yellow, color: "text-yellow-400" },
                  { label: t("stats.redCards"), value: stats.red, color: "text-accent" },
                  { label: t("stats.minutes"), value: stats.minutes, color: "text-white/70" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-secondary rounded-xl border border-white/5 p-4 text-center">
                    <p className={`font-bebas text-3xl leading-none ${color}`}>{value}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <div>
                <h2 className="font-bebas text-2xl text-white mb-3">БИОГРАФИЯ</h2>
                <div className="bg-secondary rounded-xl border border-white/5 p-5">
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{bio}</p>
                </div>
              </div>
            )}

            {/* Recent matches */}
            {recentMatches.length > 0 && (
              <div>
                <h2 className="font-bebas text-2xl text-white mb-4">ПОСЛЕДНИЕ МАТЧИ</h2>
                <div className="bg-secondary rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-4 py-3 text-left text-white/40 font-medium uppercase tracking-wider">Матч</th>
                        <th className="px-3 py-3 text-center text-white/40 font-medium uppercase tracking-wider">М</th>
                        <th className="px-3 py-3 text-center text-white/40 font-medium uppercase tracking-wider">Г</th>
                        <th className="px-3 py-3 text-center text-white/40 font-medium uppercase tracking-wider">П</th>
                        <th className="px-3 py-3 text-center text-white/40 font-medium uppercase tracking-wider">МИН</th>
                        <th className="px-3 py-3 text-center text-white/40 font-medium uppercase tracking-wider">ЖК</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMatches.map((row: any, i: number) => {
                        const match = row.matches;
                        const opponentName = match?.[`opponent_${loc}`] || match?.opponent_ru || "—";
                        const score = match?.score_home != null
                          ? `${match.score_home}:${match.score_away}`
                          : "—";
                        return (
                          <tr
                            key={i}
                            className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="text-white font-medium truncate max-w-[140px]">{opponentName}</p>
                              <p className="text-white/30 mt-0.5">{score}</p>
                            </td>
                            <td className="px-3 py-3 text-center text-white/70">{row.is_starter ? "Осн." : "Зап."}</td>
                            <td className="px-3 py-3 text-center">
                              <span className={row.goals > 0 ? "text-accent2 font-bold" : "text-white/40"}>{row.goals}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={row.assists > 0 ? "text-win font-bold" : "text-white/40"}>{row.assists}</span>
                            </td>
                            <td className="px-3 py-3 text-center text-white/50">{row.minutes_played ?? "—"}</td>
                            <td className="px-3 py-3 text-center">
                              {row.yellow_cards > 0 && (
                                <span className="inline-block w-3 h-4 bg-yellow-400 rounded-sm" />
                              )}
                              {row.yellow_cards === 0 && <span className="text-white/20">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0 space-y-5">
            {/* Shooting accuracy */}
            {stats.shots > 0 && (
              <div className="bg-secondary rounded-xl border border-white/5 p-5">
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-4">Точность ударов</h3>
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff10" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        stroke="#e94560"
                        strokeWidth="3"
                        strokeDasharray={`${(stats.shotsOn / stats.shots) * 100} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-bebas text-2xl text-white">
                        {Math.round((stats.shotsOn / stats.shots) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-white/40">
                    <span>Всего ударов</span>
                    <span className="text-white">{stats.shots}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>В створ</span>
                    <span className="text-win">{stats.shotsOn}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rating */}
            {stats.avgRating && (
              <div className="bg-secondary rounded-xl border border-white/5 p-5 text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Ср. рейтинг</p>
                <p className="font-bebas text-5xl text-accent2">{stats.avgRating}</p>
                <p className="text-white/30 text-[10px] mt-1">за {stats.matches} матчей</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
