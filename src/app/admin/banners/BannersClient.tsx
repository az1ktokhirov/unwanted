"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon, MousePointer } from "lucide-react";
import Image from "next/image";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import StatWidget from "@/components/admin/StatWidget";
import { saveBanner, deleteBanner } from "./actions";

interface Banner {
  id: string;
  name: string;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  device: string;
  views: number;
  clicks: number;
}

const PLACEMENTS = [
  "hero_slider",
  "below_hero",
  "news_sidebar",
  "match_sidebar",
  "player_page_bottom",
  "media_top",
];

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: "Активен", cls: "bg-win/20 text-win" },
  inactive: { label: "Неактивен", cls: "bg-gray-500/20 text-gray-400" },
  scheduled: { label: "Запланирован", cls: "bg-blue-500/20 text-blue-400" },
};

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const totalViews = banners.reduce((s, b) => s + (b.views ?? 0), 0);
  const totalClicks = banners.reduce((s, b) => s + (b.clicks ?? 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
  const active = banners.filter((b) => b.status === "active").length;

  const filtered = banners.filter((b) =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.placement?.includes(search.toLowerCase())
  );

  function openCreate() { setEditItem(null); setImageUrl(""); setError(""); setPanelOpen(true); }
  function openEdit(b: Banner) { setEditItem(b); setImageUrl(b.image_url ?? ""); setError(""); setPanelOpen(true); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("image_url", imageUrl);
    startTransition(async () => {
      const res = await saveBanner(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteBanner(deleteId);
      setBanners((prev) => prev.filter((b) => b.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Баннеры</h1>
          <p className="text-admin-muted text-sm">{banners.length} баннеров</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить баннер
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatWidget icon={<ImageIcon size={16} />} value={banners.length} label="Всего" />
        <StatWidget icon={<ImageIcon size={16} />} value={active} label="Активных" color="text-win" />
        <StatWidget icon={<ImageIcon size={16} />} value={totalViews.toLocaleString()} label="Показов/мес" />
        <StatWidget icon={<MousePointer size={16} />} value={totalClicks.toLocaleString()} label="Кликов/мес" />
        <StatWidget icon={<MousePointer size={16} />} value={`${ctr}%`} label="CTR" color="text-yellow-400" />
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
          className="w-full pl-8 pr-3 py-2 bg-admin-sidebar border border-admin-border rounded-lg text-white text-sm placeholder:text-admin-muted focus:outline-none focus:border-admin-accent/50" />
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Баннер", "Размещение", "Статус", "Показы", "Клики", "CTR", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-admin-muted text-sm text-center py-10">Баннеров не найдено</td></tr>
            )}
            {filtered.map((b) => {
              const st = STATUS_LABELS[b.status] ?? { label: b.status, cls: "bg-gray-500/20 text-gray-400" };
              const bCtr = b.views > 0 ? ((b.clicks / b.views) * 100).toFixed(1) : "0.0";
              return (
                <tr key={b.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.image_url ? (
                        <div className="w-14 h-8 rounded overflow-hidden flex-shrink-0">
                          <Image src={b.image_url} alt={b.name} width={56} height={32} className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-14 h-8 rounded bg-admin-border flex items-center justify-center flex-shrink-0">
                          <ImageIcon size={14} className="text-admin-muted" />
                        </div>
                      )}
                      <p className="text-white text-sm font-medium">{b.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs font-mono">{b.placement}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{(b.views ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{(b.clicks ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white text-xs font-semibold">{bCtr}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(b)} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(b.id)} className="p-1.5 text-admin-muted hover:text-accent rounded hover:bg-accent/10 transition-colors">
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

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editItem ? "Редактировать баннер" : "Новый баннер"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editItem && <input type="hidden" name="id" value={editItem.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Изображение баннера</label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} bucket="banners" />
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Название</label>
            <input name="name" required defaultValue={editItem?.name ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Ссылка (URL)</label>
            <input name="link_url" defaultValue={editItem?.link_url ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Размещение</label>
              <select name="placement" required defaultValue={editItem?.placement ?? "hero_slider"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Тип</label>
              <select name="type" defaultValue={editItem?.type ?? "image"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="image">Изображение</option>
                <option value="video">Видео</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Дата начала</label>
              <input name="start_date" type="date" defaultValue={editItem?.start_date ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Дата окончания</label>
              <input name="end_date" type="date" defaultValue={editItem?.end_date ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Статус</label>
              <select name="status" defaultValue={editItem?.status ?? "active"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
                <option value="scheduled">Запланирован</option>
              </select>
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Устройство</label>
              <select name="device" defaultValue={editItem?.device ?? "all"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="all">Все</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Приоритет</label>
              <input name="priority" type="number" defaultValue={editItem?.priority ?? 0}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
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
        title="Удалить баннер?"
        message="Баннер будет удалён безвозвратно."
      />
    </div>
  );
}
