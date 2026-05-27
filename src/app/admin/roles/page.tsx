import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLES = [
  { name: "super_admin", label: "Супер Администратор", desc: "Полный доступ ко всем функциям", users: 1 },
  { name: "admin", label: "Администратор", desc: "Управление контентом и пользователями", users: 2 },
  { name: "manager", label: "Менеджер", desc: "Управление матчами, игроками, новостями", users: 3 },
  { name: "editor", label: "Редактор", desc: "Создание и редактирование контента", users: 5 },
  { name: "moderator", label: "Модератор", desc: "Модерация комментариев и публикаций", users: 2 },
  { name: "viewer", label: "Наблюдатель", desc: "Только просмотр данных", users: 1 },
];

const PERMISSIONS = [
  { section: "Матчи", perms: ["Просмотр", "Создание", "Редактирование", "Удаление"] },
  { section: "Игроки", perms: ["Просмотр", "Создание", "Редактирование", "Удаление"] },
  { section: "Новости", perms: ["Просмотр", "Создание", "Редактирование", "Удаление", "Публикация"] },
  { section: "Медиа", perms: ["Просмотр", "Загрузка", "Редактирование", "Удаление"] },
  { section: "Партнёры", perms: ["Просмотр", "Создание", "Редактирование", "Удаление"] },
  { section: "Пользователи", perms: ["Просмотр", "Создание", "Блокировка"] },
  { section: "Настройки", perms: ["Просмотр", "Редактирование"] },
];

const ROLE_ACCESS: Record<string, Record<string, boolean>> = {
  super_admin: { all: true },
  admin: { "Матчи.Просмотр": true, "Матчи.Создание": true, "Матчи.Редактирование": true, "Матчи.Удаление": true, "Игроки.Просмотр": true, "Игроки.Создание": true, "Игроки.Редактирование": true, "Игроки.Удаление": true, "Новости.Просмотр": true, "Новости.Создание": true, "Новости.Редактирование": true, "Новости.Удаление": true, "Новости.Публикация": true, "Медиа.Просмотр": true, "Медиа.Загрузка": true, "Медиа.Редактирование": true, "Медиа.Удаление": true, "Партнёры.Просмотр": true, "Партнёры.Создание": true, "Партнёры.Редактирование": true, "Партнёры.Удаление": true, "Пользователи.Просмотр": true, "Настройки.Просмотр": true, "Настройки.Редактирование": true },
  editor: { "Матчи.Просмотр": true, "Матчи.Создание": true, "Матчи.Редактирование": true, "Игроки.Просмотр": true, "Новости.Просмотр": true, "Новости.Создание": true, "Новости.Редактирование": true, "Новости.Публикация": true, "Медиа.Просмотр": true, "Медиа.Загрузка": true },
  viewer: { "Матчи.Просмотр": true, "Игроки.Просмотр": true, "Новости.Просмотр": true, "Медиа.Просмотр": true },
};

export default function AdminRolesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white font-semibold text-xl">Роли и права</h1>
        <p className="text-admin-muted text-sm">Управление уровнями доступа</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Roles list */}
        <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-admin-border">
            <h2 className="text-white text-sm font-semibold">Список ролей</h2>
          </div>
          <div className="divide-y divide-admin-border">
            {ROLES.map((r) => (
              <div key={r.name} className="px-4 py-3 flex items-center justify-between hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                    <ShieldCheck size={14} className="text-admin-accent" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{r.label}</p>
                    <p className="text-admin-muted text-xs">{r.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-admin-muted text-xs">{r.users} польз.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions matrix */}
        <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-admin-border">
            <h2 className="text-white text-sm font-semibold">Матрица прав (Editor)</h2>
          </div>
          <div className="p-4 space-y-4">
            {PERMISSIONS.map(({ section, perms }) => (
              <div key={section}>
                <p className="text-admin-muted text-xs font-semibold uppercase tracking-wider mb-2">{section}</p>
                <div className="space-y-1.5">
                  {perms.map((perm) => {
                    const key = `${section}.${perm}`;
                    const hasAccess = ROLE_ACCESS.editor?.all || ROLE_ACCESS.editor?.[key];
                    return (
                      <div key={perm} className="flex items-center justify-between">
                        <span className="text-white text-xs">{perm}</span>
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${hasAccess ? "bg-admin-accent" : "bg-admin-border"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${hasAccess ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
