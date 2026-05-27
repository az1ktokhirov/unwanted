import { adminSupabase } from "@/lib/supabase/admin";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";

export const dynamic = "force-dynamic";

const ACTION_COLOR: Record<string, string> = {
  create: "bg-win/20 text-win",
  update: "bg-blue-500/20 text-blue-400",
  delete: "bg-accent/20 text-accent",
  publish: "bg-yellow-500/20 text-yellow-400",
  login: "bg-purple-500/20 text-purple-400",
  logout: "bg-gray-500/20 text-gray-400",
};

const STATUS_COLOR: Record<string, string> = {
  success: "text-win",
  error: "text-accent",
  warning: "text-yellow-400",
};

export default async function AdminLogsPage() {
  const { data: logs } = await adminSupabase
    .from("activity_logs")
    .select("*, admin_users(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  const all = logs ?? [];
  const success = all.filter((l) => l.status === "success").length;
  const warnings = all.filter((l) => l.status === "warning").length;
  const errors = all.filter((l) => l.status === "error").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white font-semibold text-xl">Журнал активности</h1>
        <p className="text-admin-muted text-sm">Последние 100 событий</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget icon={<Activity size={16} />} value={all.length} label="Всего событий" />
        <StatWidget icon={<CheckCircle size={16} />} value={success} label="Успешных" color="text-win" />
        <StatWidget icon={<AlertTriangle size={16} />} value={warnings} label="Предупреждений" color="text-yellow-400" />
        <StatWidget icon={<XCircle size={16} />} value={errors} label="Ошибок" color="text-accent" />
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Время", "Пользователь", "Действие", "Модуль", "Описание", "Статус"].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.length === 0 && (
              <tr><td colSpan={6} className="text-admin-muted text-sm text-center py-10">Нет событий</td></tr>
            )}
            {all.map((log: any) => (
              <tr key={log.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-admin-muted text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("ru", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-white text-xs">{log.admin_users?.full_name ?? "System"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ACTION_COLOR[log.action] ?? "bg-gray-500/20 text-gray-400"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">{log.module}</td>
                <td className="px-4 py-3 text-white text-xs max-w-[280px] truncate">{log.description}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold ${STATUS_COLOR[log.status] ?? "text-gray-400"}`}>
                    {log.status}
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
