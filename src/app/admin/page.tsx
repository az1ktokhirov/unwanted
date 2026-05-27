import { adminSupabase } from "@/lib/supabase/admin";
import { Users, Newspaper, Video, Trophy, BarChart2, Eye } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";
import { VisitorsChart } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

const EMPTY_DATA = {
  playerCount: 0,
  matchCount: 0,
  newsCount: 0,
  mediaCount: 0,
  recentMatches: [] as any[],
  recentNews: [] as any[],
  activityLogs: [] as any[],
  chartData: [] as { date: string; visitors: number; views: number }[],
};

async function getDashboardData() {
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString("ru", { day: "numeric", month: "short" }),
      visitors: Math.floor(200 + Math.random() * 300),
      views: Math.floor(400 + Math.random() * 600),
    };
  });

  try {
    const results = await Promise.allSettled([
      adminSupabase.from("players").select("*", { count: "exact", head: true }).eq("is_active", true),
      adminSupabase.from("matches").select("*", { count: "exact", head: true }),
      adminSupabase.from("news").select("*", { count: "exact", head: true }),
      adminSupabase.from("media").select("*", { count: "exact", head: true }),
      adminSupabase.from("matches").select("opponent_ru, score_home, score_away, status, match_date, opponent_logo_url").order("match_date", { ascending: false }).limit(4),
      adminSupabase.from("news").select("title_ru, cover_url, status, published_at").order("created_at", { ascending: false }).limit(4),
      adminSupabase.from("activity_logs").select("action, module, description, created_at").order("created_at", { ascending: false }).limit(8),
    ]);

    const val = <T,>(r: PromiseSettledResult<{ data: T | null; count?: number | null }>, fallback: T) =>
      r.status === "fulfilled" ? (r.value.data ?? fallback) : fallback;
    const cnt = (r: PromiseSettledResult<{ count: number | null }>) =>
      r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

    return {
      playerCount: cnt(results[0] as any),
      matchCount: cnt(results[1] as any),
      newsCount: cnt(results[2] as any),
      mediaCount: cnt(results[3] as any),
      recentMatches: val<any[]>(results[4] as any, []),
      recentNews: val<any[]>(results[5] as any, []),
      activityLogs: val<any[]>(results[6] as any, []),
      chartData,
    };
  } catch {
    return { ...EMPTY_DATA, chartData };
  }
}

const ACTION_COLOR: Record<string, string> = {
  create: "bg-win/20 text-win",
  update: "bg-blue-500/20 text-blue-400",
  delete: "bg-accent/20 text-accent",
  publish: "bg-yellow-500/20 text-yellow-400",
  login: "bg-purple-500/20 text-purple-400",
  logout: "bg-gray-500/20 text-gray-400",
};

export default async function AdminDashboard() {
  const { playerCount, matchCount, newsCount, mediaCount, recentMatches, recentNews, activityLogs, chartData } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-semibold text-xl">Панель управления</h1>
        <p className="text-admin-muted text-sm mt-0.5">Обзор активности сайта</p>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatWidget icon={<Eye size={16} />} value="—" label="Посетителей" change={12} />
        <StatWidget icon={<BarChart2 size={16} />} value="—" label="Просмотров" change={8} />
        <StatWidget icon={<Video size={16} />} value={mediaCount} label="Видео" />
        <StatWidget icon={<Newspaper size={16} />} value={newsCount} label="Новостей" />
        <StatWidget icon={<Trophy size={16} />} value={matchCount} label="Матчей" />
        <StatWidget icon={<Users size={16} />} value={playerCount} label="Игроков" />
      </div>

      {/* Chart */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-5">
        <h2 className="text-white text-sm font-semibold mb-4">Посетители и просмотры (14 дней)</h2>
        <VisitorsChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent matches */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-4">Последние матчи</h2>
          <div className="space-y-3">
            {recentMatches.length === 0 && <p className="text-admin-muted text-xs">Нет данных</p>}
            {(recentMatches as any[]).map((m, i) => {
              const result = m.score_home != null && m.score_away != null
                ? m.score_home > m.score_away ? "win" : m.score_home < m.score_away ? "loss" : "draw"
                : null;
              const badgeClass = result === "win" ? "bg-win/20 text-win" : result === "loss" ? "bg-accent/20 text-accent" : "bg-gray-500/20 text-gray-400";
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-admin-border last:border-0">
                  <div>
                    <p className="text-white text-xs font-semibold">UB vs {m.opponent_ru}</p>
                    <p className="text-admin-muted text-[10px]">{new Date(m.match_date).toLocaleDateString("ru")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.score_home != null && (
                      <span className="font-score text-white text-sm">{m.score_home} : {m.score_away}</span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeClass}`}>
                      {result === "win" ? "Победа" : result === "loss" ? "Поражение" : result === "draw" ? "Ничья" : m.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent news */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-4">Последние новости</h2>
          <div className="space-y-3">
            {recentNews.length === 0 && <p className="text-admin-muted text-xs">Нет данных</p>}
            {(recentNews as any[]).map((n, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-admin-border last:border-0">
                {n.cover_url && (
                  <img src={n.cover_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{n.title_ru}</p>
                  <p className="text-admin-muted text-[10px]">{n.published_at ? new Date(n.published_at).toLocaleDateString("ru") : "—"}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${n.status === "published" ? "bg-win/20 text-win" : "bg-gray-500/20 text-gray-400"}`}>
                  {n.status === "published" ? "Опубл." : n.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-5">
        <h2 className="text-white text-sm font-semibold mb-4">Последняя активность</h2>
        <div className="space-y-2">
          {activityLogs.length === 0 && <p className="text-admin-muted text-xs">Нет данных</p>}
          {(activityLogs as any[]).map((log, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-admin-border last:border-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5 flex-shrink-0 ${ACTION_COLOR[log.action] ?? "bg-gray-500/20 text-gray-400"}`}>
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs">{log.description}</p>
                <p className="text-admin-muted text-[10px]">{log.module} · {new Date(log.created_at).toLocaleString("ru")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
