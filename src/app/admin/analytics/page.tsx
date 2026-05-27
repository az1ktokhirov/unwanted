import { Eye, BarChart2, Users, MousePointer, TrendingUp } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";
import { VisitorsChart } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

const TRAFFIC_SOURCES = [
  { source: "YouTube", pct: 42, color: "bg-red-500" },
  { source: "Прямой переход", pct: 25, color: "bg-blue-500" },
  { source: "Поиск", pct: 18, color: "bg-yellow-500" },
  { source: "Социальные сети", pct: 10, color: "bg-pink-500" },
  { source: "Реферальный", pct: 5, color: "bg-green-500" },
];

const TOP_PAGES = [
  { path: "/ru/", title: "Главная", views: 4820 },
  { path: "/ru/matches", title: "Матчи", views: 2310 },
  { path: "/ru/team", title: "Команда", views: 1850 },
  { path: "/ru/news", title: "Новости", views: 1420 },
  { path: "/ru/media", title: "Медиа", views: 980 },
  { path: "/ru/stats", title: "Статистика", views: 720 },
];

export default function AdminAnalyticsPage() {
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toLocaleDateString("ru", { day: "numeric", month: "short" }),
      visitors: Math.floor(150 + Math.random() * 350),
      views: Math.floor(300 + Math.random() * 700),
    };
  });

  const maxViews = Math.max(...TOP_PAGES.map((p) => p.views));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-semibold text-xl">Аналитика</h1>
        <p className="text-admin-muted text-sm">Статистика посещаемости за 30 дней</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatWidget icon={<Users size={16} />} value="8,240" label="Посетителей" change={14} />
        <StatWidget icon={<Eye size={16} />} value="21,560" label="Просмотров" change={9} />
        <StatWidget icon={<BarChart2 size={16} />} value="2.6" label="Страниц/визит" change={-2} />
        <StatWidget icon={<MousePointer size={16} />} value="3:24" label="Время на сайте" />
        <StatWidget icon={<TrendingUp size={16} />} value="62%" label="Возврат. посет." change={5} />
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl p-5">
        <h2 className="text-white text-sm font-semibold mb-4">Посетители и просмотры (30 дней)</h2>
        <VisitorsChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Traffic sources */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-4">Источники трафика</h2>
          <div className="space-y-3">
            {TRAFFIC_SOURCES.map(({ source, pct, color }) => (
              <div key={source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs">{source}</span>
                  <span className="text-admin-muted text-xs">{pct}%</span>
                </div>
                <div className="h-1.5 bg-admin-border rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top pages */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-4">Популярные страницы</h2>
          <div className="space-y-3">
            {TOP_PAGES.map(({ path, title, views }) => (
              <div key={path}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-white text-xs font-medium">{title}</p>
                    <p className="text-admin-muted text-[10px] font-mono">{path}</p>
                  </div>
                  <span className="text-white text-xs font-semibold">{views.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-admin-border rounded-full overflow-hidden">
                  <div className="h-full bg-admin-accent rounded-full" style={{ width: `${(views / maxViews) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
