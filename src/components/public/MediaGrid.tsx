"use client";

import { useState, useMemo } from "react";
import VideoCard from "./VideoCard";
import VideoModal from "@/components/ui/VideoModal";
import type { Media } from "@/types";
import type { Locale } from "@/types";

type Category = "all" | "match" | "vlog" | "behind_scenes" | "shorts" | "training" | "interview" | "highlight";

interface Props {
  videos: Media[];
  locale: Locale;
  labels: Record<string, string>;
}

export default function MediaGrid({ videos, locale, labels }: Props) {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Media | null>(null);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const title = (v[`title_${locale}`] || v.title_ru || "").toLowerCase();
        if (!title.includes(q)) return false;
      }
      return true;
    });
  }, [videos, category, search, locale]);

  const cats: { key: Category; label: string }[] = [
    { key: "all", label: labels.all },
    { key: "match", label: labels.matches },
    { key: "vlog", label: labels.vlogs },
    { key: "behind_scenes", label: labels.behindScenes },
    { key: "shorts", label: labels.shorts },
    { key: "training", label: labels.training },
    { key: "interview", label: labels.interview },
    { key: "highlight", label: labels.highlight },
  ];

  const newVideos = filtered.slice(0, 3);
  const allVideos = filtered.slice(3);
  const featuredVideo = videos.find((v) => v.is_featured) ?? videos[0];
  const shorts = videos.filter((v) => v.category === "shorts").slice(0, 5);

  return (
    <>
      {/* Filter bar */}
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
        <div className="relative w-full sm:w-48">
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
        <p className="text-white/30 text-sm text-center py-16">{labels.noVideos}</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* New videos — 3 large */}
            {newVideos.length > 0 && (
              <div className="mb-10">
                <h2 className="font-bebas text-2xl text-white mb-4">{labels.newVideos}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {newVideos.map((v) => (
                    <VideoCard key={v.id} video={v} locale={locale} variant="large" onClick={setPlaying} />
                  ))}
                </div>
              </div>
            )}

            {/* All videos grid */}
            {allVideos.length > 0 && (
              <div>
                <h2 className="font-bebas text-2xl text-white mb-4">{labels.allVideos}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allVideos.map((v) => (
                    <VideoCard key={v.id} video={v} locale={locale} onClick={setPlaying} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Featured video */}
            {featuredVideo && (
              <div>
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">{labels.featured}</h3>
                <VideoCard video={featuredVideo} locale={locale} variant="large" onClick={setPlaying} />
                <a
                  href={`https://www.youtube.com/watch?v=${featuredVideo.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-3 w-full py-2 border border-accent/40 text-accent text-xs font-bold rounded hover:bg-accent/10 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {labels.watchOnYoutube}
                </a>
              </div>
            )}

            {/* Shorts */}
            {shorts.length > 0 && (
              <div>
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">{labels.shorts}</h3>
                <div className="space-y-3">
                  {shorts.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setPlaying(v)}
                      className="flex items-center gap-3 w-full group text-left"
                    >
                      <div className="relative w-12 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                        <img
                          src={`https://img.youtube.com/vi/${v.youtube_id}/maxresdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-accent/80 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3 ml-0.5">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-white text-xs font-medium line-clamp-2 flex-1 group-hover:text-accent transition-colors">
                        {v[`title_${locale}`] || v.title_ru}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Video modal */}
      {playing && (
        <VideoModal
          youtubeId={playing.youtube_id}
          title={playing[`title_${locale}`] || playing.title_ru}
          onClose={() => setPlaying(null)}
        />
      )}
    </>
  );
}
