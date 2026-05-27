"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Handshake } from "lucide-react";
import Image from "next/image";
import SlidePanel from "@/components/admin/SlidePanel";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import StatWidget from "@/components/admin/StatWidget";
import { savePartner, deletePartner } from "./actions";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  description_ru: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_start: string | null;
  contract_end: string | null;
  status: string;
  priority: number;
  views_count: number;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: "Активен", cls: "bg-win/20 text-win" },
  inactive: { label: "Неактивен", cls: "bg-gray-500/20 text-gray-400" },
  pending: { label: "Ожидание", cls: "bg-blue-500/20 text-blue-400" },
  expired: { label: "Истёк", cls: "bg-accent/20 text-accent" },
};

const CATEGORIES = ["equipment", "food", "finance", "media", "insurance", "telecom", "other"];

export default function PartnersClient({ initialPartners }: { initialPartners: Partner[] }) {
  const [partners, setPartners] = useState(initialPartners);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const active = partners.filter((p) => p.status === "active").length;

  const filtered = partners.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setEditItem(null); setLogoUrl(""); setError(""); setPanelOpen(true); }
  function openEdit(p: Partner) { setEditItem(p); setLogoUrl(p.logo_url ?? ""); setError(""); setPanelOpen(true); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("logo_url", logoUrl);
    startTransition(async () => {
      const res = await savePartner(fd);
      if (res.error) { setError(res.error); return; }
      setPanelOpen(false);
      window.location.reload();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deletePartner(deleteId);
      setPartners((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Партнёры</h1>
          <p className="text-admin-muted text-sm">{partners.length} партнёров</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={16} /> Добавить партнёра
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatWidget icon={<Handshake size={16} />} value={partners.length} label="Всего" />
        <StatWidget icon={<Handshake size={16} />} value={active} label="Активных" color="text-win" />
        <StatWidget icon={<Handshake size={16} />} value={partners.length - active} label="Неактивных" color="text-gray-400" />
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
              {["Партнёр", "Категория", "Статус", "Контракт", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-admin-muted text-sm text-center py-10">Партнёров не найдено</td></tr>
            )}
            {filtered.map((p) => {
              const st = STATUS_LABELS[p.status] ?? { label: p.status, cls: "bg-gray-500/20 text-gray-400" };
              return (
                <tr key={p.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.logo_url ? (
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                          <Image src={p.logo_url} alt={p.name} width={32} height={32} className="object-contain" unoptimized />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-admin-border flex items-center justify-center flex-shrink-0">
                          <span className="text-admin-muted text-xs font-bold">{p.name?.[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-semibold">{p.name}</p>
                        {p.website && <p className="text-admin-muted text-[10px] truncate max-w-[150px]">{p.website}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{p.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">
                    {p.contract_end ? new Date(p.contract_end).toLocaleDateString("ru") : "—"}
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

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={editItem ? "Редактировать партнёра" : "Новый партнёр"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editItem && <input type="hidden" name="id" value={editItem.id} />}

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Логотип</label>
            <ImageUpload value={logoUrl} onChange={setLogoUrl} bucket="partners" />
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Название</label>
            <input name="name" required defaultValue={editItem?.name ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Сайт</label>
              <input name="website" type="url" defaultValue={editItem?.website ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Категория</label>
              <select name="category" defaultValue={editItem?.category ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="">Без категории</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-admin-muted text-xs mb-1 block">Описание (RU)</label>
            <textarea name="description_ru" rows={2} defaultValue={editItem?.description_ru ?? ""}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Контактное лицо</label>
              <input name="contact_person" defaultValue={editItem?.contact_person ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Email</label>
              <input name="contact_email" type="email" defaultValue={editItem?.contact_email ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Начало контракта</label>
              <input name="contract_start" type="date" defaultValue={editItem?.contract_start ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Окончание контракта</label>
              <input name="contract_end" type="date" defaultValue={editItem?.contract_end ?? ""}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-admin-muted text-xs mb-1 block">Статус</label>
              <select name="status" defaultValue={editItem?.status ?? "active"}
                className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50">
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
                <option value="pending">Ожидание</option>
                <option value="expired">Истёк</option>
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
        title="Удалить партнёра?"
        message="Партнёр будет удалён безвозвратно."
      />
    </div>
  );
}
