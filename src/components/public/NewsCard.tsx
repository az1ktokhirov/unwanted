import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { News } from "@/types";
import type { Locale } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  match: "bg-accent/20 text-accent",
  club: "bg-blue-500/20 text-blue-400",
  interview: "bg-purple-500/20 text-purple-400",
  media: "bg-yellow-500/20 text-yellow-400",
  announcement: "bg-green-500/20 text-green-400",
  tournament: "bg-orange-500/20 text-orange-400",
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  match: { uz: "O'yin", ru: "Матч", en: "Match" },
  club: { uz: "Klub", ru: "Клуб", en: "Club" },
  interview: { uz: "Intervyu", ru: "Интервью", en: "Interview" },
  media: { uz: "Media", ru: "Медиа", en: "Media" },
  announcement: { uz: "E'lon", ru: "Анонс", en: "Announcement" },
  tournament: { uz: "Turnir", ru: "Турнир", en: "Tournament" },
};

interface Props {
  news: News;
  locale: Locale;
  variant?: "default" | "featured" | "compact";
}

export default function NewsCard({ news, locale, variant = "default" }: Props) {
  const title = news[`title_${locale}`] || news.title_ru;
  const excerpt = news[`excerpt_${locale}`] || news.excerpt_ru;
  const catLabel = CATEGORY_LABELS[news.category]?.[locale] ?? news.category;
  const catColor = CATEGORY_COLORS[news.category] ?? "bg-white/10 text-white/60";
  const date = news.published_at
    ? new Date(news.published_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  if (variant === "compact") {
    return (
      <Link href={`/news/${news.slug}`} className="group flex gap-3 items-start">
        <div className="w-16 h-12 rounded bg-surface overflow-hidden flex-shrink-0">
          {news.cover_url ? (
            <Image src={news.cover_url} alt={title} width={64} height={48} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <span className="text-white/20 text-xs">UB</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${catColor}`}>{catLabel}</span>
          <p className="text-white text-xs font-semibold line-clamp-2 mt-0.5 group-hover:text-accent transition-colors">{title}</p>
          {date && <p className="text-white/30 text-[10px] mt-0.5">{date}</p>}
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-1">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/news/${news.slug}`} className="group relative block rounded-xl overflow-hidden h-full">
        <div className="relative h-80 bg-surface">
          {news.cover_url ? (
            <Image src={news.cover_url} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 60vw" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent text-[10px] font-black tracking-widest uppercase">{catLabel}</span>
            {date && <span className="text-white/30 text-[10px]">· {date}</span>}
          </div>
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 group-hover:text-accent/90 transition-colors">{title}</h3>
          {excerpt && <p className="text-white/50 text-xs mt-2 line-clamp-2">{excerpt}</p>}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${news.slug}`} className="group block bg-secondary rounded-xl border border-white/5 hover:border-accent/30 overflow-hidden transition-colors">
      <div className="relative h-44 bg-surface overflow-hidden">
        {news.cover_url ? (
          <Image src={news.cover_url} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-secondary flex items-center justify-center">
            <span className="font-bebas text-4xl text-white/10">UB</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${catColor}`}>{catLabel}</span>
        </div>
      </div>
      <div className="p-4">
        {date && <p className="text-white/30 text-[10px] mb-1">{date}</p>}
        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">{title}</h3>
        {excerpt && <p className="text-white/40 text-xs mt-1.5 line-clamp-2">{excerpt}</p>}
      </div>
    </Link>
  );
}
