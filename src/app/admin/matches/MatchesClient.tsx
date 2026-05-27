"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Trophy, CalendarDays } from "lucide-react";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveMatch, deleteMatch } from "./actions";

interface Match {
  id: string;
  opponent_uz: string;
  opponent_ru: string;
  opponent_en: string;
  opponent_logo_url: string | null;
  match_date: string;
  venue_ru: string | null;
  competition_ru: string | null;
  season: string;
  round: string | null;
  score_home: number | null;
  score_away: number | null;
  status: string;
  highlight_url: string | null;
  stadium: string | null;
  attendance: number | null;
  referee: string | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "Предстоящий", cls: "bg-blue-500/20 text-blue-400" },
  finished: { label: "Завершён", cls: "bg-win/20 text-win" },
  live: { label: "Прямой эфир", cls: "bg-accent/20 text-accent" },
  draft: { label: "Черновик", cls: "bg-gray-500/20 text-gray-400" },
};

const TABS = ["Все", "Предстоящие", "Прошедшие", "Черновики"];

export default function MatchesClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered = matches.filter((m) => {
    const matchesTab =
      tab === 0 ? true :
      tab === 1 ? m.status === "upcoming" :
      tab === 2 ? m.status === "finished" :
      m.status === "draft";
    const matchesSearch = !search || m.opponent_ru?.toLowerCase().includes(search.toLowerCase()) || m.competition_ru?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function openCreate() {
    setEditMatch(null);
    setLogoUrl("");
    setError("");
    setPanelOpen(true);
  }

  function openEdit(m: Match) {
    setEditMatch(m);
    setLogoUrl(m.opponent_logo_url ?? "");
    setError("");
    setPanelOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("opponent_logo_url", logoUrl);
    startTransition(async () => {
      const res = await saveMatch(fd);
      if (res.error) { setError(res.error); return; }
      // Refresh
      const updated = await fetch("/admin/matches?_data").catch(() => null);
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteMatch(deleteId);
      setMatches((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Матчи</h1>
          <p className="text-admin-muted text-sm">{matches.length} матчей</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить матч
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-admin-sidebar rounded-lg p-1 border border-admin-border">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${tab === i ? "bg-admin-accent text-white" : "text-admin-muted hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
            className="w-full pl-8 pr-3 py-2 bg-admin-sidebar border border-admin-border rounded-lg text-white text-sm placeholder:text-admin-muted focus:outline-none focus:border-admin-accent/50" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Дата", "Матч", "Турнир", "Счёт", "Статус", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-admin-muted text-sm text-center py-10">Матчей не найдено</td></tr>
            )}
            {filtered.map((m) => {
              const st = STATUS_LABELS[m.status] ?? { label: m.status, cls: "bg-gray-500/20 text-gray-400" };
              return (
                <tr key={m.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-admin-muted text-xs">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      {new Date(m.match_date).toLocaleDateString("ru")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.opponent_logo_url && <img src={m.opponent_logo_url} alt="" className="w-6 h-6 rounded object-contain" />}
                      <span className="text-white text-sm font-medium">UB vs {m.opponent_ru}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{m.competition_ru ?? "—"}</td>
                  <td className="px-4 py-3">
                    {m.score_home != null ? (
                      <span className="font-score text-white text-sm">{m.score_home} : {m.score_away}</span>
                    ) : <span className="text-admin-muted text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1.5 text-admin-muted hover:text-accent rounded hover:bg-accent/10 transition-colors">
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
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editMatch ? "Редактировать матч" : "Новый матч"} width="w-[560px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editMatch && <input type="hidden" name="id" value={editMatch.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Логотип соперника</label>
            <ImageUpload value={logoUrl} onChange={setLogoUrl} bucket="opponents" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["uz", "ru", "en"] as const).map((lang) => (
              <div key={lang}>
                <label className="text-admin-muted text-xs mb-1 block">Соперник ({lang.toUpperCase()})</label>
                <input name={`opponent_${lang}`} required defaultValue={(editMatch as any)?.[`opponent_${lang}`] ?? ""}
                  className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Дата и время</label>
              <input name="match_date" type="datetime-local" required
                defaultValue={editMatch ? new Date(editMatch.match_date).toISOString().slice(0, 16) : ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Статус</label>
              <select name="status" defaultValue={editMatch?.status ?? "upcoming"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="upcoming">Предстоящий</option>
                <option value="finished">Завершён</option>
                <option value="live">Прямой эфир</option>
                <option value="draft">Черновик</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Счёт (дома)</label>
              <input name="score_home" type="number" min="0" defaultValue={editMatch?.score_home ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Счёт (гости)</label>
              <input name="score_away" type="number" min="0" defaultValue={editMatch?.score_away ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Турнир</label>
              <input name="competition_ru" defaultValue={editMatch?.competition_ru ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Сезон</label>
              <input name="season" defaultValue={editMatch?.season ?? "2026"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Стадион</label>
            <input name="stadium" defaultValue={editMatch?.stadium ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Ссылка на хайлайт (YouTube)</label>
            <input name="highlight_url" defaultValue={editMatch?.highlight_url ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
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
        title="Удалить матч?"
        message="Матч и все связанные данные (события, статистика) будут удалены. Это действие необратимо."
      />
    </div>
  );
}
