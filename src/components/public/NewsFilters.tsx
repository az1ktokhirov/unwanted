"use client";

import { useState, useMemo } from "react";
import NewsCard from "./NewsCard";
import type { News } from "@/types";
import type { Locale } from "@/types";

type Category = "all" | "match" | "club" | "interview" | "media" | "announcement" | "tournament";

interface Props {
  news: News[];
  locale: Locale;
  labels: Record<string, string>;
}

export default function NewsFilters({ news, locale, labels }: Props) {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return news.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const title = (n[`title_${locale}`] || n.title_ru || "").toLowerCase();
        const excerpt = (n[`excerpt_${locale}`] || n.excerpt_ru || "").toLowerCase();
        if (!title.includes(q) && !excerpt.includes(q)) return false;
      }
      return true;
    });
  }, [news, category, search, locale]);

  const cats: { key: Category; label: string }[] = [
    { key: "all", label: labels.all },
    { key: "announcement", label: labels.announcements },
    { key: "match", label: labels.match },
    { key: "interview", label: labels.interview },
    { key: "club", label: labels.club },
    { key: "media", label: labels.media },
    { key: "tournament", label: labels.tournament },
  ];

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
        <div className="flex flex-wrap gap-1 flex-1">
          {cats.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase transition-colors ${
                category === key
                  ? "bg-accent text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-52">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.search}
            className="w-full bg-secondary border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-16">{labels.noNews}</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Featured + grid */}
          <div className="flex-1 min-w-0">
            {featured && (
              <div className="mb-6">
                <span className="inline-block mb-3 text-[10px] font-black tracking-[0.3em] text-accent uppercase border border-accent/30 px-2 py-0.5 rounded">
                  {labels.newsOfDay}
                </span>
                <NewsCard news={featured} locale={locale} variant="featured" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rest.map((n) => (
                <NewsCard key={n.id} news={n} locale={locale} variant="default" />
              ))}
            </div>
          </div>

          {/* Recent list sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase">{labels.latest}</h3>
            {news.slice(0, 8).map((n) => (
              <NewsCard key={n.id} news={n} locale={locale} variant="compact" />
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
