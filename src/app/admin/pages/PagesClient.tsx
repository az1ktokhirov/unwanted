"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Globe } from "lucide-react";
import SlidePanel from "@/components/admin/SlidePanel";
import ImageUpload from "@/components/admin/ImageUpload";
import dynamic from "next/dynamic";
import { savePage } from "./actions";

const MarkdownEditor = dynamic(() => import("@/components/admin/MarkdownEditor"), { ssr: false });

interface Page {
  id: string;
  slug: string;
  title_ru: string;
  title_uz: string;
  title_en: string;
  content_ru: string | null;
  content_uz: string | null;
  content_en: string | null;
  cover_url: string | null;
  is_published: boolean;
  updated_at: string | null;
}

type Lang = "ru" | "uz" | "en";

export default function PagesClient({ initialPages }: { initialPages: Page[] }) {
  const [pages, setPages] = useState(initialPages);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [lang, setLang] = useState<Lang>("ru");
  const [contents, setContents] = useState<Record<Lang, string>>({ ru: "", uz: "", en: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function openCreate() {
    setEditPage(null);
    setCoverUrl("");
    setContents({ ru: "", uz: "", en: "" });
    setError("");
    setPanelOpen(true);
  }

  function openEdit(p: Page) {
    setEditPage(p);
    setCoverUrl(p.cover_url ?? "");
    setContents({ ru: p.content_ru ?? "", uz: p.content_uz ?? "", en: p.content_en ?? "" });
    setError("");
    setPanelOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("cover_url", coverUrl);
    fd.set("content_ru", contents.ru);
    fd.set("content_uz", contents.uz);
    fd.set("content_en", contents.en);
    startTransition(async () => {
      const res = await savePage(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Страницы</h1>
          <p className="text-admin-muted text-sm">{pages.length} страниц</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить страницу
        </button>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Slug", "Заголовок", "Статус", "Обновлено", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && (
              <tr><td colSpan={5} className="text-admin-muted text-sm text-center py-10">Страниц нет</td></tr>
            )}
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-admin-accent text-xs font-mono">
                    <Globe size={12} /> /{p.slug}
                  </div>
                </td>
                <td className="px-4 py-3 text-white text-sm">{p.title_ru}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.is_published ? "bg-win/20 text-win" : "bg-gray-500/20 text-gray-400"}`}>
                    {p.is_published ? "Опубл." : "Скрыто"}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">
                  {p.updated_at ? new Date(p.updated_at).toLocaleDateString("ru") : "—"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editPage ? "Редактировать страницу" : "Новая страница"} width="w-[680px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editPage && <input type="hidden" name="id" value={editPage.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Обложка</label>
            <ImageUpload value={coverUrl} onChange={setCoverUrl} bucket="pages" />
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Slug (URL)</label>
            <input name="slug" required defaultValue={editPage?.slug ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm font-mono focus:outline-none focus:border-admin-accent/50" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["ru", "uz", "en"] as Lang[]).map((l) => (
              <div key={l}>
                <label className="text-admin-muted text-xs mb-1 block">Заголовок ({l.toUpperCase()})</label>
                <input name={`title_${l}`} required={l === "ru"} defaultValue={(editPage as any)?.[`title_${l}`] ?? ""}
                  className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-admin-muted text-xs">Контент</label>
              <div className="flex gap-1">
                {(["RU", "UZ", "EN"] as const).map((lt) => {
                  const l = lt.toLowerCase() as Lang;
                  return (
                    <button key={lt} type="button" onClick={() => setLang(l)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${lang === l ? "bg-admin-accent text-white" : "bg-admin-sidebar text-admin-muted hover:text-white"}`}>
                      {lt}
                    </button>
                  );
                })}
              </div>
            </div>
            <MarkdownEditor
              value={contents[lang]}
              onChange={(v) => setContents((prev) => ({ ...prev, [lang]: v }))}
              height={300}
            />
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Статус</label>
            <select name="is_published" defaultValue={editPage?.is_published !== false ? "true" : "false"}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
              <option value="true">Опубликована</option>
              <option value="false">Скрыта</option>
            </select>
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
    </div>
  );
}
