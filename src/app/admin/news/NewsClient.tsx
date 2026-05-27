"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Eye, FileText } from "lucide-react";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import StatWidget from "@/components/admin/StatWidget";
import dynamic from "next/dynamic";
import { saveNews, deleteNews } from "./actions";

const MarkdownEditor = dynamic(() => import("@/components/admin/MarkdownEditor"), { ssr: false });

interface NewsItem {
  id: string;
  title_ru: string;
  cover_url: string | null;
  status: string;
  category: string | null;
  published_at: string | null;
  views: number;
  slug: string;
  tags: string[] | null;
  excerpt_ru: string | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Черновик", cls: "bg-gray-500/20 text-gray-400" },
  published: { label: "Опубликована", cls: "bg-win/20 text-win" },
  scheduled: { label: "Запланирована", cls: "bg-blue-500/20 text-blue-400" },
  archived: { label: "Архив", cls: "bg-yellow-500/20 text-yellow-400" },
};

const CATEGORIES = ["match", "club", "interview", "media", "announcement", "tournament"];

const LANG_TABS = ["RU", "UZ", "EN"] as const;
type Lang = "ru" | "uz" | "en";

export default function NewsClient({ initialNews }: { initialNews: NewsItem[] }) {
  const [news, setNews] = useState(initialNews);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [bodyLang, setBodyLang] = useState<Lang>("ru");
  const [bodies, setBodies] = useState<Record<Lang, string>>({ ru: "", uz: "", en: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const counts = {
    total: news.length,
    published: news.filter((n) => n.status === "published").length,
    draft: news.filter((n) => n.status === "draft").length,
    scheduled: news.filter((n) => n.status === "scheduled").length,
    archived: news.filter((n) => n.status === "archived").length,
  };

  const filtered = news.filter((n) => {
    const matchStatus = statusFilter === "all" || n.status === statusFilter;
    const matchSearch = !search || n.title_ru?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function openCreate() {
    setEditItem(null);
    setCoverUrl("");
    setBodies({ ru: "", uz: "", en: "" });
    setError("");
    setPanelOpen(true);
  }

  async function openEdit(item: NewsItem) {
    setEditItem(item);
    setCoverUrl(item.cover_url ?? "");
    setError("");
    // Fetch full bodies
    const { data } = await import("@/lib/supabase/client").then(({ createClient }) =>
      createClient().from("news").select("body_uz, body_ru, body_en").eq("id", item.id).single()
    );
    setBodies({ ru: data?.body_ru ?? "", uz: data?.body_uz ?? "", en: data?.body_en ?? "" });
    setPanelOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("cover_url", coverUrl);
    fd.set("body_ru", bodies.ru);
    fd.set("body_uz", bodies.uz);
    fd.set("body_en", bodies.en);
    startTransition(async () => {
      const res = await saveNews(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteNews(deleteId);
      setNews((prev) => prev.filter((n) => n.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Новости</h1>
          <p className="text-admin-muted text-sm">{news.length} материалов</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить новость
        </button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatWidget icon={<FileText size={16} />} value={counts.total} label="Всего" />
        <StatWidget icon={<Eye size={16} />} value={counts.published} label="Опубликовано" color="text-win" />
        <StatWidget icon={<FileText size={16} />} value={counts.draft} label="Черновиков" color="text-gray-400" />
        <StatWidget icon={<FileText size={16} />} value={counts.scheduled} label="Запланировано" color="text-blue-400" />
        <StatWidget icon={<FileText size={16} />} value={counts.archived} label="В архиве" color="text-yellow-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-admin-sidebar rounded-lg p-1 border border-admin-border">
          {(["all", "published", "draft", "scheduled", "archived"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${statusFilter === s ? "bg-admin-accent text-white" : "text-admin-muted hover:text-white"}`}>
              {s === "all" ? "Все" : STATUS_LABELS[s]?.label ?? s}
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
              {["Новость", "Категория", "Статус", "Дата", "Просм.", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-admin-muted text-sm text-center py-10">Новостей не найдено</td></tr>
            )}
            {filtered.map((n) => {
              const st = STATUS_LABELS[n.status] ?? { label: n.status, cls: "bg-gray-500/20 text-gray-400" };
              return (
                <tr key={n.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {n.cover_url && <img src={n.cover_url} alt="" className="w-10 h-8 rounded object-cover flex-shrink-0" />}
                      <p className="text-white text-sm font-medium line-clamp-1">{n.title_ru}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{n.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">
                    {n.published_at ? new Date(n.published_at).toLocaleDateString("ru") : "—"}
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{n.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(n)} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(n.id)} className="p-1.5 text-admin-muted hover:text-accent rounded hover:bg-accent/10 transition-colors">
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
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editItem ? "Редактировать новость" : "Новая новость"} width="w-[680px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editItem && <input type="hidden" name="id" value={editItem.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Обложка</label>
            <ImageUpload value={coverUrl} onChange={setCoverUrl} bucket="news" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(["ru", "uz", "en"] as Lang[]).map((lang) => (
              <div key={lang}>
                <label className="text-admin-muted text-xs mb-1 block">Заголовок ({lang.toUpperCase()})</label>
                <input name={`title_${lang}`} required={lang === "ru"} defaultValue={(editItem as any)?.[`title_${lang}`] ?? ""}
                  className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Краткое описание (RU)</label>
            <textarea name="excerpt_ru" rows={2} defaultValue={editItem?.excerpt_ru ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50 resize-none" />
          </div>

          {/* Body editor with lang tabs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-admin-muted text-xs">Текст статьи</label>
              <div className="flex gap-1">
                {LANG_TABS.map((lt) => {
                  const l = lt.toLowerCase() as Lang;
                  return (
                    <button key={lt} type="button" onClick={() => setBodyLang(l)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${bodyLang === l ? "bg-admin-accent text-white" : "bg-admin-sidebar text-admin-muted hover:text-white"}`}>
                      {lt}
                    </button>
                  );
                })}
              </div>
            </div>
            <MarkdownEditor
              value={bodies[bodyLang]}
              onChange={(v) => setBodies((prev) => ({ ...prev, [bodyLang]: v }))}
              height={280}
            />
          </div>

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
              <label className="text-admin-muted text-xs mb-1 block">Статус</label>
              <select name="status" defaultValue={editItem?.status ?? "draft"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="draft">Черновик</option>
                <option value="published">Опубликовать</option>
                <option value="scheduled">Запланировать</option>
                <option value="archived">В архив</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Slug (URL)</label>
              <input name="slug" defaultValue={editItem?.slug ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Дата публикации</label>
              <input name="published_at" type="datetime-local"
                defaultValue={editItem?.published_at ? new Date(editItem.published_at).toISOString().slice(0, 16) : ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Теги (через запятую)</label>
            <input name="tags" defaultValue={editItem?.tags?.join(", ") ?? ""}
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
        title="Удалить новость?"
        message="Эта новость будет удалена безвозвратно."
      />
    </div>
  );
}
