"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveStanding, deleteStanding } from "./actions";

interface Standing {
  id: string;
  season: string;
  competition: string;
  team_name: string;
  team_logo_url: string | null;
  is_unwanted_boys: boolean;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}

export default function StandingsClient({ initialStandings }: { initialStandings: Standing[] }) {
  const [standings, setStandings] = useState(initialStandings);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editItem, setEditItem] = useState<Standing | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");

  const seasons = [...new Set(standings.map((s) => s.season))].sort().reverse();
  const activeSeason = seasonFilter || seasons[0] || "";
  const filtered = standings.filter((s) => !activeSeason || s.season === activeSeason);

  function openCreate() { setEditItem(null); setLogoUrl(""); setError(""); setPanelOpen(true); }
  function openEdit(s: Standing) { setEditItem(s); setLogoUrl(s.team_logo_url ?? ""); setError(""); setPanelOpen(true); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("team_logo_url", logoUrl);
    startTransition(async () => {
      const res = await saveStanding(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteStanding(deleteId);
      setStandings((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Турнирная таблица</h1>
          <p className="text-admin-muted text-sm">{standings.length} команд в базе</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить команду
        </button>
      </div>

      {/* Season filter */}
      <div className="flex gap-2">
        {seasons.map((s) => (
          <button key={s} onClick={() => setSeasonFilter(s === activeSeason ? "" : s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeSeason === s ? "bg-admin-accent text-white" : "bg-admin-sidebar border border-admin-border text-admin-muted hover:text-white"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["#", "Команда", "Турнир", "И", "В", "Н", "П", "ГЗ", "ГП", "РМ", "Очки", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={12} className="text-admin-muted text-sm text-center py-10">Нет данных</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className={`border-b border-admin-border last:border-0 transition-colors ${s.is_unwanted_boys ? "bg-admin-accent/5 hover:bg-admin-accent/10" : "hover:bg-white/2"}`}>
                <td className="px-3 py-3 text-white font-score text-sm font-bold">{s.position}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {s.team_logo_url && <img src={s.team_logo_url} alt="" className="w-5 h-5 rounded object-contain" />}
                    <span className={`text-sm font-medium ${s.is_unwanted_boys ? "text-admin-accent" : "text-white"}`}>
                      {s.team_name}
                      {s.is_unwanted_boys && <span className="ml-1 text-[9px] bg-admin-accent/20 text-admin-accent px-1 rounded">UB</span>}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-admin-muted text-xs">{s.competition}</td>
                {[s.played, s.won, s.drawn, s.lost, s.goals_for, s.goals_against].map((v, i) => (
                  <td key={i} className="px-3 py-3 text-admin-muted font-score text-xs">{v}</td>
                ))}
                <td className={`px-3 py-3 font-score text-xs ${s.goal_diff > 0 ? "text-win" : s.goal_diff < 0 ? "text-accent" : "text-admin-muted"}`}>
                  {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
                </td>
                <td className="px-3 py-3 text-white font-score font-bold text-sm">{s.points}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-admin-muted hover:text-accent rounded hover:bg-accent/10 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editItem ? "Редактировать команду" : "Добавить команду"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editItem && <input type="hidden" name="id" value={editItem.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Логотип команды</label>
            <ImageUpload value={logoUrl} onChange={setLogoUrl} bucket="opponents" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Название команды</label>
              <input name="team_name" required defaultValue={editItem?.team_name ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Это Unwanted Boys?</label>
              <select name="is_unwanted_boys" defaultValue={editItem?.is_unwanted_boys ? "true" : "false"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Турнир</label>
              <input name="competition" required defaultValue={editItem?.competition ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Сезон</label>
              <input name="season" required defaultValue={editItem?.season ?? "2026"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {["position", "played", "won", "drawn", "lost", "goals_for", "goals_against", "points"].map((field) => (
              <div key={field}>
                <label className="text-admin-muted text-[10px] mb-1 block uppercase">{field.replace("_", " ")}</label>
                <input name={field} type="number" min="0" defaultValue={(editItem as any)?.[field] ?? 0}
                  className="w-full px-2 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
              </div>
            ))}
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
        title="Удалить команду?"
        message="Команда будет удалена из турнирной таблицы."
      />
    </div>
  );
}
