import { adminSupabase } from "@/lib/supabase/admin";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Target, Footprints, Star, Clock, AlertTriangle } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlayerStatsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let player = null;
  let statsRaw = null;
  try {
    [{ data: player }, { data: statsRaw }] = await Promise.all([
      adminSupabase.from("players").select("*").eq("id", id).single(),
      adminSupabase
        .from("player_stats")
        .select("*, matches(opponent_ru, match_date, score_home, score_away, status)")
        .eq("player_id", id)
        .order("matches(match_date)", { ascending: false }),
    ]);
  } catch { /* Supabase unavailable */ }

  if (!player) notFound();

  const stats = (statsRaw ?? []) as any[];
  const totals = stats.reduce(
    (acc, s) => ({
      goals: acc.goals + (s.goals ?? 0),
      assists: acc.assists + (s.assists ?? 0),
      yellow: acc.yellow + (s.yellow_cards ?? 0),
      red: acc.red + (s.red_cards ?? 0),
      minutes: acc.minutes + (s.minutes_played ?? 0),
      shots: acc.shots + (s.shots_total ?? 0),
      rating: acc.rating + (s.rating ?? 0),
    }),
    { goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0, shots: 0, rating: 0 }
  );
  const avgRating = stats.length > 0 ? (totals.rating / stats.length).toFixed(1) : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/stats" className="p-2 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-white font-semibold text-xl">Статистика игрока</h1>
          <p className="text-admin-muted text-sm">{player.name_ru}</p>
        </div>
      </div>

      {/* Player header */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-5 flex items-center gap-5">
        {player.photo_url ? (
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image src={player.photo_url} alt={player.name_ru} width={64} height={64} className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-admin-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="font-bebas text-3xl text-admin-accent">{player.number ?? "#"}</span>
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-lg">{player.name_ru}</p>
          <p className="text-admin-muted text-sm">{player.position_ru}</p>
          <p className="text-admin-muted text-xs mt-0.5">#{player.number} · {player.nationality}</p>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatWidget icon={<Target size={16} />} value={totals.goals} label="Голы" color="text-accent" />
        <StatWidget icon={<Footprints size={16} />} value={totals.assists} label="Ассисты" color="text-blue-400" />
        <StatWidget icon={<Star size={16} />} value={avgRating} label="Ср. рейтинг" color="text-win" />
        <StatWidget icon={<Target size={16} />} value={totals.shots} label="Удары" />
        <StatWidget icon={<AlertTriangle size={16} />} value={totals.yellow} label="Жёлтые" color="text-yellow-400" />
        <StatWidget icon={<Clock size={16} />} value={totals.minutes} label="Минут" />
      </div>

      {/* Match history */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-admin-border">
          <h2 className="text-white text-sm font-semibold">История матчей ({stats.length})</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Матч", "Дата", "Г", "А", "Уд.", "ЖК", "КК", "Мин.", "Рейт.", "Стартовый"].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 && (
              <tr><td colSpan={10} className="text-admin-muted text-sm text-center py-10">Нет данных</td></tr>
            )}
            {stats.map((s, i) => (
              <tr key={i} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-2.5 text-white text-xs">
                  UB vs {s.matches?.opponent_ru ?? "—"}
                  {s.matches?.score_home != null && (
                    <span className="text-admin-muted ml-1 font-score">{s.matches.score_home}:{s.matches.score_away}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-admin-muted text-xs">
                  {s.matches?.match_date ? new Date(s.matches.match_date).toLocaleDateString("ru") : "—"}
                </td>
                <td className="px-4 py-2.5 text-accent font-score text-sm">{s.goals ?? 0}</td>
                <td className="px-4 py-2.5 text-blue-400 font-score text-sm">{s.assists ?? 0}</td>
                <td className="px-4 py-2.5 text-white font-score text-sm">{s.shots_total ?? 0}</td>
                <td className="px-4 py-2.5 text-yellow-400 font-score text-sm">{s.yellow_cards ?? 0}</td>
                <td className="px-4 py-2.5 text-accent font-score text-sm">{s.red_cards ?? 0}</td>
                <td className="px-4 py-2.5 text-admin-muted font-score text-xs">{s.minutes_played ?? 0}</td>
                <td className="px-4 py-2.5 text-win font-score text-sm">{s.rating ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-semibold ${s.is_starter ? "text-win" : "text-admin-muted"}`}>
                    {s.is_starter ? "Да" : "Нет"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
