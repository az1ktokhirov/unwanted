"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Video, Star } from "lucide-react";
import Image from "next/image";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatWidget from "@/components/admin/StatWidget";
import { saveMedia, deleteMedia } from "./actions";

interface MediaItem {
  id: string;
  title_ru: string;
  youtube_id: string;
  thumbnail_url: string | null;
  category: string | null;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  duration_seconds: number | null;
  published_at: string | null;
  title_uz: string;
  title_en: string;
}

const CATEGORIES = ["match", "vlog", "behind_scenes", "shorts", "training", "interview", "highlight"];

function fmtDuration(secs: number | null) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MediaClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const totalViews = media.reduce((s, m) => s + (m.views_count ?? 0), 0);
  const published = media.filter((m) => m.is_published).length;
  const featured = media.filter((m) => m.is_featured).length;

  const filtered = media.filter((m) => {
    const matchCat = catFilter === "all" || m.category === catFilter;
    const matchSearch = !search || m.title_ru?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function openCreate() {
    setEditItem(null);
    setError("");
    setPanelOpen(true);
  }

  function openEdit(item: MediaItem) {
    setEditItem(item);
    setError("");
    setPanelOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveMedia(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteMedia(deleteId);
      setMedia((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Медиа</h1>
          <p className="text-admin-muted text-sm">{media.length} видео</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить видео
        </button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget icon={<Video size={16} />} value={media.length} label="Всего видео" />
        <StatWidget icon={<Video size={16} />} value={published} label="Опубликовано" color="text-win" />
        <StatWidget icon={<Star size={16} />} value={featured} label="Избранных" color="text-yellow-400" />
        <StatWidget icon={<Video size={16} />} value={totalViews.toLocaleString()} label="Просмотров" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-admin-sidebar rounded-lg p-1 border border-admin-border flex-wrap">
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${catFilter === c ? "bg-admin-accent text-white" : "text-admin-muted hover:text-white"}`}>
              {c === "all" ? "Все" : c}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
            className="w-full pl-8 pr-3 py-2 bg-admin-sidebar border border-admin-border rounded-lg text-white text-sm placeholder:text-admin-muted focus:outline-none focus:border-admin-accent/50" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-admin-muted text-sm text-center py-10">Видео не найдено</div>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="bg-admin-card border border-admin-border rounded-xl overflow-hidden group hover:border-admin-accent/30 transition-colors">
            <div className="relative aspect-video bg-black">
              {item.thumbnail_url && (
                <Image src={item.thumbnail_url} alt={item.title_ru} fill className="object-cover" unoptimized />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(item)} className="p-2 bg-white/10 rounded-full text-white hover:bg-admin-accent transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="p-2 bg-white/10 rounded-full text-white hover:bg-accent transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              {item.is_featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">★ Featured</div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                {fmtDuration(item.duration_seconds)}
              </div>
            </div>
            <div className="p-3">
              <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{item.title_ru}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-admin-muted text-[10px]">{item.category ?? "—"}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.is_published ? "bg-win/20 text-win" : "bg-gray-500/20 text-gray-400"}`}>
                  {item.is_published ? "Опубл." : "Скрыто"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form panel */}
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editItem ? "Редактировать видео" : "Добавить видео"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editItem && <input type="hidden" name="id" value={editItem.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">YouTube ID</label>
            <input name="youtube_id" required placeholder="dQw4w9WgXcQ" defaultValue={editItem?.youtube_id ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm font-mono focus:outline-none focus:border-admin-accent/50" />
            <p className="text-admin-muted text-[10px] mt-1">ID из ссылки youtube.com/watch?v=<strong>ID</strong></p>
          </div>

          {(["ru", "uz", "en"] as const).map((lang) => (
            <div key={lang}>
              <label className="text-admin-muted text-xs mb-1 block">Название ({lang.toUpperCase()})</label>
              <input name={`title_${lang}`} required={lang === "ru"} defaultValue={(editItem as any)?.[`title_${lang}`] ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Категория</label>
              <select name="category" defaultValue={editItem?.category ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="">Без категории</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Длительность (сек)</label>
              <input name="duration_seconds" type="number" min="0" defaultValue={editItem?.duration_seconds ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Дата публикации</label>
            <input name="published_at" type="datetime-local"
              defaultValue={editItem?.published_at ? new Date(editItem.published_at).toISOString().slice(0, 16) : ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_published_check" defaultChecked={editItem?.is_published !== false}
                onChange={(e) => { const hid = e.currentTarget.form?.querySelector<HTMLInputElement>('[name="is_published"]'); if (hid) hid.value = e.currentTarget.checked ? "true" : "false"; }}
                className="w-4 h-4 rounded accent-admin-accent" />
              <span className="text-admin-muted text-xs">Опубликовано</span>
              <input type="hidden" name="is_published" defaultValue={editItem?.is_published !== false ? "true" : "false"} />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_featured_check" defaultChecked={editItem?.is_featured === true}
                onChange={(e) => { const hid = e.currentTarget.form?.querySelector<HTMLInputElement>('[name="is_featured"]'); if (hid) hid.value = e.currentTarget.checked ? "true" : "false"; }}
                className="w-4 h-4 rounded accent-admin-accent" />
              <span className="text-admin-muted text-xs">Избранное</span>
              <input type="hidden" name="is_featured" defaultValue={editItem?.is_featured ? "true" : "false"} />
            </label>
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
        title="Удалить видео?"
        message="Видео будет удалено из медиа-библиотеки."
      />
    </div>
  );
}
