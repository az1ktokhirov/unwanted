import { adminSupabase } from "@/lib/supabase/admin";
import Image from "next/image";
import Link from "next/link";
import { Target, Footprints, Star, Clock, ChevronRight } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  let players = null;
  let statsRaw = null;
  try {
    [{ data: players }, { data: statsRaw }] = await Promise.all([
      adminSupabase
        .from("players")
        .select("id, name_ru, photo_url, position_ru, number")
        .eq("is_active", true)
        .order("number"),
      adminSupabase
        .from("player_stats")
        .select("player_id, goals, assists, yellow_cards, red_cards, minutes_played, rating"),
    ]);
  } catch { /* Supabase unavailable */ }

  const statsMap = new Map<string, { goals: number; assists: number; yellow: number; red: number; minutes: number; rating: number; games: number }>();
  for (const s of (statsRaw ?? [])) {
    const cur = statsMap.get(s.player_id) ?? { goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0, rating: 0, games: 0 };
    statsMap.set(s.player_id, {
      goals: cur.goals + (s.goals ?? 0),
      assists: cur.assists + (s.assists ?? 0),
      yellow: cur.yellow + (s.yellow_cards ?? 0),
      red: cur.red + (s.red_cards ?? 0),
      minutes: cur.minutes + (s.minutes_played ?? 0),
      rating: cur.rating + (s.rating ?? 0),
      games: cur.games + 1,
    });
  }

  const rows = (players ?? []).map((p: any) => {
    const s = statsMap.get(p.id);
    return {
      ...p,
      goals: s?.goals ?? 0,
      assists: s?.assists ?? 0,
      yellow: s?.yellow ?? 0,
      red: s?.red ?? 0,
      minutes: s?.minutes ?? 0,
      avgRating: s && s.games > 0 ? (s.rating / s.games).toFixed(1) : "—",
      games: s?.games ?? 0,
    };
  });

  const totalGoals = rows.reduce((s, r) => s + r.goals, 0);
  const totalAssists = rows.reduce((s, r) => s + r.assists, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white font-semibold text-xl">Статистика игроков</h1>
        <p className="text-admin-muted text-sm">Агрегированная статистика по всем матчам</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget icon={<Target size={16} />} value={totalGoals} label="Голов" color="text-accent" />
        <StatWidget icon={<Footprints size={16} />} value={totalAssists} label="Ассистов" color="text-blue-400" />
        <StatWidget icon={<Star size={16} />} value={players?.length ?? 0} label="Игроков в базе" />
        <StatWidget icon={<Clock size={16} />} value={rows.reduce((s, r) => s + r.minutes, 0)} label="Минут сыграно" />
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Игрок", "Позиция", "Игры", "Голы", "Ассисты", "Жёлтые", "Красные", "Минуты", "Рейтинг", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={10} className="text-admin-muted text-sm text-center py-10">Нет данных</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.photo_url ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={r.photo_url} alt={r.name_ru} width={32} height={32} className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-admin-border flex items-center justify-center flex-shrink-0">
                        <span className="text-admin-muted text-xs">{r.name_ru?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold">{r.name_ru}</p>
                      <p className="text-admin-muted text-[10px]">#{r.number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">{r.position_ru}</td>
                <td className="px-4 py-3 text-white text-sm font-score">{r.games}</td>
                <td className="px-4 py-3 text-accent font-score text-sm font-bold">{r.goals}</td>
                <td className="px-4 py-3 text-blue-400 font-score text-sm">{r.assists}</td>
                <td className="px-4 py-3 text-yellow-400 font-score text-sm">{r.yellow}</td>
                <td className="px-4 py-3 text-accent font-score text-sm">{r.red}</td>
                <td className="px-4 py-3 text-admin-muted text-xs font-score">{r.minutes}</td>
                <td className="px-4 py-3 text-win text-sm font-score">{r.avgRating}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/stats/${r.id}`} className="p-1.5 text-admin-muted hover:text-admin-accent rounded hover:bg-admin-accent/10 transition-colors inline-flex">
                    <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
