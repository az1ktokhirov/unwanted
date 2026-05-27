"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Swords,
  UserSquare2,
  TrendingUp,
  Newspaper,
  Video,
  FileText,
  Handshake,
  Image,
  ShieldCheck,
  ScrollText,
  DatabaseBackup,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "ПАНЕЛЬ УПРАВЛЕНИЯ",
    items: [
      { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
      { href: "/admin/users", label: "Пользователи", icon: Users },
      { href: "/admin/settings", label: "Настройки", icon: Settings },
    ],
  },
  {
    label: "КОНТЕНТ",
    items: [
      { href: "/admin/matches", label: "Матчи", icon: Swords },
      { href: "/admin/players", label: "Игроки", icon: UserSquare2 },
      { href: "/admin/stats", label: "Статистика", icon: TrendingUp },
      { href: "/admin/news", label: "Новости", icon: Newspaper },
      { href: "/admin/media", label: "Медиа", icon: Video },
      { href: "/admin/pages", label: "Страницы", icon: FileText },
      { href: "/admin/partners", label: "Партнёры", icon: Handshake },
      { href: "/admin/banners", label: "Баннеры", icon: Image },
    ],
  },
  {
    label: "СИСТЕМА",
    items: [
      { href: "/admin/roles", label: "Роли", icon: ShieldCheck },
      { href: "/admin/logs", label: "Логи", icon: ScrollText },
      { href: "/admin/backups", label: "Бэкапы", icon: DatabaseBackup },
    ],
  },
];

export default function AdminSidebar({ userEmail, userName }: { userEmail?: string; userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-[210px] min-h-screen bg-admin-sidebar flex flex-col flex-shrink-0 border-r border-admin-border">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-admin-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-admin-accent flex items-center justify-center">
            <span className="text-white text-xs font-black">UB</span>
          </div>
          <div>
            <p className="text-white text-xs font-bold tracking-widest leading-none">UNWANTED</p>
            <p className="text-admin-accent text-[10px] font-bold tracking-widest leading-none">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-4 py-1.5 text-[10px] font-bold tracking-widest text-admin-muted">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded text-xs font-medium transition-colors group ${
                    active
                      ? "bg-admin-accent text-white"
                      : "text-[#9ca3af] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={12} className="opacity-70" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 py-3 border-t border-admin-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-admin-accent/20 flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-admin-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{userName ?? "Admin"}</p>
            <p className="text-admin-muted text-[10px] truncate">{userEmail ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-white/5 text-xs transition-colors"
        >
          <LogOut size={13} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
