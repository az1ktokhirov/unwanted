import Image from "next/image";
import type { Media } from "@/types";
import type { Locale } from "@/types";

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function formatDuration(s: number | null) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const CAT_COLORS: Record<string, string> = {
  match: "bg-accent/80",
  vlog: "bg-purple-500/80",
  behind_scenes: "bg-blue-500/80",
  shorts: "bg-pink-500/80",
  training: "bg-green-500/80",
  interview: "bg-yellow-500/80",
  highlight: "bg-orange-500/80",
};

interface Props {
  video: Media;
  locale: Locale;
  variant?: "default" | "large" | "compact";
  onClick?: (video: Media) => void;
}

export default function VideoCard({ video, locale, variant = "default", onClick }: Props) {
  const title = video[`title_${locale}`] || video.title_ru;
  const thumb = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`;
  const duration = formatDuration(video.duration_seconds);
  const catColor = CAT_COLORS[video.category] ?? "bg-white/50";

  const content = (
    <div className={`group cursor-pointer ${variant === "large" ? "block" : "block"}`} onClick={() => onClick?.(video)}>
      <div className={`relative overflow-hidden rounded-xl bg-surface ${variant === "large" ? "h-56 sm:h-72" : variant === "compact" ? "h-24" : "h-44"}`}>
        <Image
          src={thumb}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes={variant === "large" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"}
          onError={() => {}}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/90 group-hover:bg-accent flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {duration}
          </div>
        )}

        {/* Category */}
        <div className={`absolute top-2 left-2 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${catColor}`}>
          {video.category.replace("_", " ")}
        </div>
      </div>

      <div className={`${variant === "compact" ? "py-1" : "pt-3"}`}>
        <p className={`text-white font-semibold line-clamp-2 group-hover:text-accent/90 transition-colors ${variant === "large" ? "text-base" : "text-sm"}`}>
          {title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-white/30 text-[10px]">
          {video.views_count > 0 && <span>{formatViews(video.views_count)} views</span>}
          {video.published_at && (
            <span>
              {new Date(video.published_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return content;
}
