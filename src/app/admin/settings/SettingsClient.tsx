"use client";

import { useState, useTransition } from "react";
import { Save, Check } from "lucide-react";
import { saveSettings } from "./actions";

interface Props { settings: Record<string, string>; }

const FIELDS = [
  { key: "site_name", label: "Название сайта", type: "text" },
  { key: "club_motto_ru", label: "Девиз клуба (RU)", type: "text" },
  { key: "founded_year", label: "Год основания", type: "text" },
  { key: "social_youtube", label: "YouTube", type: "url" },
  { key: "social_instagram", label: "Instagram", type: "url" },
  { key: "social_telegram", label: "Telegram", type: "url" },
  { key: "social_tiktok", label: "TikTok", type: "url" },
  { key: "contact_email", label: "Email", type: "email" },
  { key: "contact_phone", label: "Телефон", type: "text" },
  { key: "address", label: "Адрес", type: "text" },
  { key: "copyright_text", label: "Копирайт", type: "text" },
];

export default function SettingsClient({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveSettings(fd);
      if (res.error) { setError(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Настройки</h1>
          <p className="text-admin-muted text-sm">Основные настройки сайта</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-4">
          <h2 className="text-white text-sm font-semibold border-b border-admin-border pb-3">Общая информация</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-admin-muted text-xs mb-1 block">{label}</label>
                <input
                  name={key}
                  type={type}
                  defaultValue={settings[key] ?? ""}
                  className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent/50"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-accent text-xs mt-2">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={isPending}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${saved ? "bg-win text-white" : "bg-admin-accent hover:bg-admin-accent/90 text-white"}`}>
            {saved ? <><Check size={16} /> Сохранено</> : <><Save size={16} /> {isPending ? "Сохранение..." : "Сохранить"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
