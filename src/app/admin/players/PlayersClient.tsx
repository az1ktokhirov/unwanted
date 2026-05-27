"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Users, ShieldOff, Activity } from "lucide-react";
import Image from "next/image";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import StatWidget from "@/components/admin/StatWidget";
import { savePlayer, deletePlayer } from "./actions";

interface Player {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  position_uz: string;
  position_ru: string;
  position_en: string;
  number: number | null;
  photo_url: string | null;
  birthdate: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  nationality: string;
  dominant_foot: string | null;
  joined_date: string | null;
  contract_until: string | null;
  status: string;
  is_active: boolean;
  bio_ru: string | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: "Активен", cls: "bg-win/20 text-win" },
  reserve: { label: "Запас", cls: "bg-blue-500/20 text-blue-400" },
  injured: { label: "Травмирован", cls: "bg-yellow-500/20 text-yellow-400" },
  inactive: { label: "Неактивен", cls: "bg-gray-500/20 text-gray-400" },
};

function age(birthdate: string | null) {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function PlayersClient({ initialPlayers }: { initialPlayers: Player[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const active = players.filter((p) => p.status === "active").length;
  const reserve = players.filter((p) => p.status === "reserve").length;
  const injured = players.filter((p) => p.status === "injured").length;
  const contractExpiring = players.filter((p) => {
    if (!p.contract_until) return false;
    const diff = new Date(p.contract_until).getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 3600 * 1000;
  }).length;

  const filtered = players.filter((p) =>
    !search ||
    p.name_ru?.toLowerCase().includes(search.toLowerCase()) ||
    p.position_ru?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditPlayer(null);
    setPhotoUrl("");
    setError("");
    setPanelOpen(true);
  }

  function openEdit(p: Player) {
    setEditPlayer(p);
    setPhotoUrl(p.photo_url ?? "");
    setError("");
    setPanelOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("photo_url", photoUrl);
    startTransition(async () => {
      const res = await savePlayer(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deletePlayer(deleteId);
      setPlayers((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Игроки</h1>
          <p className="text-admin-muted text-sm">{players.length} игроков в базе</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить игрока
        </button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatWidget icon={<Users size={16} />} value={players.length} label="Всего" />
        <StatWidget icon={<Activity size={16} />} value={active} label="Основной состав" color="text-win" />
        <StatWidget icon={<Users size={16} />} value={reserve} label="Запас" color="text-blue-400" />
        <StatWidget icon={<ShieldOff size={16} />} value={injured} label="Травмированы" color="text-yellow-400" />
        <StatWidget icon={<ShieldOff size={16} />} value={contractExpiring} label="Контракт истекает" color="text-accent" />
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск игрока..."
          className="w-full pl-8 pr-3 py-2 bg-admin-sidebar border border-admin-border rounded-lg text-white text-sm placeholder:text-admin-muted focus:outline-none focus:border-admin-accent/50" />
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Игрок", "Позиция", "#", "Статус", "Возраст", "Контракт", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-admin-muted text-sm text-center py-10">Игроков не найдено</td></tr>
            )}
            {filtered.map((p) => {
              const st = STATUS_LABELS[p.status] ?? { label: p.status, cls: "bg-gray-500/20 text-gray-400" };
              return (
                <tr key={p.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.photo_url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={p.photo_url} alt={p.name_ru} width={32} height={32} className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-admin-border flex items-center justify-center flex-shrink-0">
                          <span className="text-admin-muted text-xs font-bold">{p.name_ru?.[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-semibold">{p.name_ru}</p>
                        <p className="text-admin-muted text-[10px]">{p.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{p.position_ru}</td>
                  <td className="px-4 py-3 text-white font-score text-sm">{p.number ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{age(p.birthdate) ?? "—"}</td>
                  <td className="px-4 py-3 text-admin-muted text-xs">
                    {p.contract_until ? new Date(p.contract_until).toLocaleDateString("ru") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-admin-muted hover:text-accent rounded hover:bg-accent/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form panel */}
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editPlayer ? "Редактировать игрока" : "Новый игрок"} width="w-[580px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editPlayer && <input type="hidden" name="id" value={editPlayer.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Фото игрока</label>
            <ImageUpload value={photoUrl} onChange={setPhotoUrl} bucket="players" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["uz", "ru", "en"] as const).map((lang) => (
              <div key={lang}>
                <label className="text-admin-muted text-xs mb-1 block">Имя ({lang.toUpperCase()})</label>
                <input name={`name_${lang}`} required defaultValue={(editPlayer as any)?.[`name_${lang}`] ?? ""}
                  className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["uz", "ru", "en"] as const).map((lang) => (
              <div key={lang}>
                <label className="text-admin-muted text-xs mb-1 block">Позиция ({lang.toUpperCase()})</label>
                <input name={`position_${lang}`} required defaultValue={(editPlayer as any)?.[`position_${lang}`] ?? ""}
                  className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Номер</label>
              <input name="number" type="number" min="1" max="99" defaultValue={editPlayer?.number ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Статус</label>
              <select name="status" defaultValue={editPlayer?.status ?? "active"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="active">Активен</option>
                <option value="reserve">Запас</option>
                <option value="injured">Травмирован</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Активен на сайте</label>
              <select name="is_active" defaultValue={editPlayer?.is_active === false ? "false" : "true"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Дата рождения</label>
              <input name="birthdate" type="date" defaultValue={editPlayer?.birthdate ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Рост (см)</label>
              <input name="height_cm" type="number" defaultValue={editPlayer?.height_cm ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Вес (кг)</label>
              <input name="weight_kg" type="number" defaultValue={editPlayer?.weight_kg ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Национальность</label>
              <input name="nationality" defaultValue={editPlayer?.nationality ?? "Uzbekistan"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Рабочая нога</label>
              <select name="dominant_foot" defaultValue={editPlayer?.dominant_foot ?? "right"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="right">Правая</option>
                <option value="left">Левая</option>
                <option value="both">Обе</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Дата вступления</label>
              <input name="joined_date" type="date" defaultValue={editPlayer?.joined_date ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Контракт до</label>
              <input name="contract_until" type="date" defaultValue={editPlayer?.contract_until ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Биография (RU)</label>
            <textarea name="bio_ru" rows={3} defaultValue={editPlayer?.bio_ru ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50 resize-none" />
          </div>

          {error && <p className="text-accent text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPanelOpen(false)}
              className="flex-1 py-2 border border-admin-border text-admin-muted hover:text-white rounded-lg text-sm transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </SlidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isPending}
        title="Удалить игрока?"
        message="Игрок и вся его статистика будут удалены. Это действие необратимо."
      />
    </div>
  );
}
