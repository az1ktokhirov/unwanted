import { adminSupabase } from "@/lib/supabase/admin";
import { Users, UserCheck, ShieldCheck, UserX } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";

export const dynamic = "force-dynamic";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-accent/20 text-accent",
  admin: "bg-purple-500/20 text-purple-400",
  manager: "bg-blue-500/20 text-blue-400",
  editor: "bg-yellow-500/20 text-yellow-400",
  moderator: "bg-green-500/20 text-green-400",
  viewer: "bg-gray-500/20 text-gray-400",
};

export default async function AdminUsersPage() {
  let users = null;
  try {
    ({ data: users } = await adminSupabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false }));
  } catch { /* Supabase unavailable */ }

  const all = users ?? [];
  const active = all.filter((u) => u.is_active).length;
  const admins = all.filter((u) => ["super_admin", "admin"].includes(u.role)).length;
  const blocked = all.filter((u) => !u.is_active).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white font-semibold text-xl">Пользователи</h1>
        <p className="text-admin-muted text-sm">{all.length} администраторов</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget icon={<Users size={16} />} value={all.length} label="Всего" />
        <StatWidget icon={<UserCheck size={16} />} value={active} label="Активных" color="text-win" />
        <StatWidget icon={<ShieldCheck size={16} />} value={admins} label="Администраторов" color="text-purple-400" />
        <StatWidget icon={<UserX size={16} />} value={blocked} label="Заблокировано" color="text-accent" />
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Пользователь", "Email", "Роль", "Статус", "Последний вход", "Зарегистрирован"].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.length === 0 && (
              <tr><td colSpan={6} className="text-admin-muted text-sm text-center py-10">Пользователей нет</td></tr>
            )}
            {all.map((u: any) => (
              <tr key={u.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-admin-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-admin-accent text-xs font-bold">{u.full_name?.[0]}</span>
                      </div>
                    )}
                    <p className="text-white text-sm font-semibold">{u.full_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[u.role] ?? "bg-gray-500/20 text-gray-400"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.is_active ? "bg-win/20 text-win" : "bg-accent/20 text-accent"}`}>
                    {u.is_active ? "Активен" : "Заблокирован"}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">
                  {u.last_login ? new Date(u.last_login).toLocaleDateString("ru") : "—"}
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("ru") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
