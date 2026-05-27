import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import CountdownTimer from "@/components/ui/CountdownTimer";
import LeagueTable from "@/components/public/LeagueTable";
import PlayerCard from "@/components/public/PlayerCard";
import VideoCard from "@/components/public/VideoCard";
import NewsCard from "@/components/public/NewsCard";
import type { Match, Player, Media, News, LeagueStanding } from "@/types";
import type { Locale } from "@/types";

async function getData(locale: Locale) {
  try {
    const supabase = await createClient();
    const [
      { data: nextMatchData },
      { data: recentData },
      { data: standingsData },
      { data: playersData },
      { data: videosData },
      { data: newsData },
    ] = await Promise.all([
      supabase.from("matches").select("*").in("status", ["upcoming", "live"]).order("match_date", { ascending: true }).limit(1),
      supabase.from("matches").select("*").eq("status", "finished").order("match_date", { ascending: false }).limit(5),
      supabase.from("league_standings").select("*").order("position", { ascending: true }).limit(8),
      supabase.from("players").select("*").eq("is_active", true).eq("status", "active").order("number", { ascending: true, nullsFirst: false }).limit(4),
      supabase.from("media").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(4),
      supabase.from("news").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(3),
    ]);

    return {
      nextMatch: (nextMatchData?.[0] ?? null) as Match | null,
      recentMatches: (recentData ?? []) as Match[],
      standings: (standingsData ?? []) as LeagueStanding[],
      players: (playersData ?? []) as Player[],
      videos: (videosData ?? []) as Media[],
      news: (newsData ?? []) as News[],
    };
  } catch {
    return { nextMatch: null, recentMatches: [], standings: [], players: [], videos: [], news: [] };
  }
}

function ResultBadge({ home, away }: { home: number; away: number }) {
  if (home > away) return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-win/20 text-win">W</span>;
  if (home === away) return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-draw/20 text-draw">D</span>;
  return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-accent/20 text-accent">L</span>;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const loc = locale as Locale;
  const { nextMatch, recentMatches, standings, players, videos, news } = await getData(loc);

  const featuredVideo = videos[0] ?? null;
  const sideVideos = videos.slice(1, 4);

  const nextMatchDate = nextMatch ? new Date(nextMatch.match_date) : null;
  const nextOpponent = nextMatch ? ((nextMatch as any)[`opponent_${loc}`] || nextMatch.opponent_ru) : null;
  const nextCompetition = nextMatch ? ((nextMatch as any)[`competition_${loc}`] || nextMatch.competition_ru) : null;
  const nextVenue = nextMatch ? ((nextMatch as any)[`venue_${loc}`] || nextMatch.venue_ru) : null;

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#e94560_0%,_transparent_60%)] opacity-10" />

        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Hero text */}
            <div className="flex-1 pt-10 lg:pt-0">
              <p className="text-accent text-xs font-bold tracking-[0.4em] uppercase mb-4">
                UNWANTED BOYS FC
              </p>
              <h1 className="font-bebas leading-none mb-6">
                <span className="block text-white text-7xl sm:text-8xl lg:text-9xl tracking-wider">WE ARE</span>
                <span className="block text-accent text-7xl sm:text-8xl lg:text-9xl tracking-wider">UNWANTED</span>
                <span className="block text-white text-7xl sm:text-8xl lg:text-9xl tracking-wider">BOYS</span>
              </h1>
              <p className="text-white/50 text-base max-w-md mb-8">
                Самый популярный медиафутбольный клуб Узбекистана. Страсть. Характер. Движение.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/matches"
                  className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold text-sm tracking-widest uppercase rounded transition-colors"
                >
                  {t("nav.matches")}
                </Link>
                <Link
                  href="/team"
                  className="px-6 py-3 border border-white/30 hover:border-white text-white font-bold text-sm tracking-widest uppercase rounded transition-colors"
                >
                  {t("nav.team")}
                </Link>
              </div>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { href: "http://www.youtube.com/@IslomAbdujabborov", label: "YouTube", svg: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
                  { href: "https://instagram.com/unwantedboys.uz", label: "Instagram", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                  { href: "https://t.me/unwantedboys", label: "Telegram", svg: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
                ].map(({ href, label, svg }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-accent flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d={svg} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Next match widget */}
            {nextMatch && nextMatchDate && (
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-secondary/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <p className="text-accent text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                    {t("match.nextMatch")}
                  </p>
                  <p className="text-white/40 text-xs mb-4">{nextCompetition}</p>

                  {/* Teams */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                        <span className="text-accent text-lg font-black">UB</span>
                      </div>
                      <span className="text-white text-xs font-bold text-center">UNWANTED BOYS</span>
                    </div>

                    <div className="text-center">
                      <span className="font-bebas text-2xl text-white/30">VS</span>
                      <p className="text-white/30 text-[10px] mt-1">
                        {nextMatchDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                      </p>
                      <p className="text-white/50 text-xs font-bold">
                        {nextMatchDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                        {nextMatch.opponent_logo_url ? (
                          <Image src={nextMatch.opponent_logo_url} alt={nextOpponent ?? ""} width={56} height={56} className="object-contain" />
                        ) : (
                          <span className="text-white/30 text-xs font-bold">{nextOpponent?.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-white text-xs font-bold text-center">{nextOpponent}</span>
                    </div>
                  </div>

                  {nextVenue && (
                    <p className="text-white/30 text-[10px] text-center mb-4">📍 {nextVenue}</p>
                  )}

                  {/* Countdown */}
                  <div className="border-t border-white/10 pt-4">
                    <CountdownTimer
                      targetDate={nextMatch.match_date}
                      labels={{
                        days: t("common.days"),
                        hours: t("common.hours"),
                        minutes: t("common.minutes"),
                        seconds: t("common.seconds"),
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── RECENT RESULTS ── */}
      {recentMatches.length > 0 && (
        <section className="bg-secondary border-y border-white/5 py-8">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bebas text-2xl text-white tracking-widest">{t("match.recentResults")}</h2>
              <Link href="/matches" className="text-accent text-xs font-bold tracking-wider hover:underline">{t("common.seeAll")}</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {recentMatches.map((m) => {
                const opp = (m as any)[`opponent_${loc}`] || m.opponent_ru;
                const hasScore = m.score_home != null;
                return (
                  <Link key={m.id} href="/matches" className="flex-shrink-0 w-44 bg-primary rounded-xl border border-white/5 hover:border-accent/30 p-4 transition-colors group">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2 truncate">
                      {(m as any)[`competition_${loc}`] || m.competition_ru}
                    </p>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent text-[9px] font-black">UB</span>
                      </div>
                      <div className="text-center flex-1">
                        {hasScore ? (
                          <span className="font-bebas text-xl text-white">{m.score_home} : {m.score_away}</span>
                        ) : <span className="text-white/30 text-xs">vs</span>}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {m.opponent_logo_url ? (
                          <Image src={m.opponent_logo_url} alt={opp} width={32} height={32} className="object-contain" />
                        ) : (
                          <span className="text-white/30 text-[9px] font-bold">{opp.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/50 text-[10px] truncate text-center mb-1">{opp}</p>
                    {hasScore && (
                      <div className="flex justify-center">
                        <ResultBadge home={m.score_home!} away={m.score_away!} />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LEAGUE TABLE + SQUAD ── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* League table */}
          {standings.length > 0 && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bebas text-2xl text-white tracking-widest">ТУРНИРНАЯ ТАБЛИЦА</h2>
              </div>
              <LeagueTable standings={standings} maxRows={8} />
            </div>
          )}

          {/* Squad preview */}
          {players.length > 0 && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bebas text-2xl text-white tracking-widest">{t("nav.team").toUpperCase()}</h2>
                <Link href="/team" className="text-accent text-xs font-bold tracking-wider hover:underline">{t("common.seeAll")}</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {players.map((p) => (
                  <PlayerCard key={p.id} player={p} nameLang={loc} positionLang={loc} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MEDIA ── */}
      {videos.length > 0 && (
        <section className="bg-secondary border-y border-white/5 py-14">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bebas text-3xl text-white tracking-widest">{t("nav.media").toUpperCase()}</h2>
              <Link href="/media" className="text-accent text-xs font-bold tracking-wider hover:underline">{t("common.seeAll")}</Link>
            </div>
            <div className="flex flex-col lg:flex-row gap-5">
              {featuredVideo && (
                <div className="lg:flex-1">
                  <Link href="/media">
                    <VideoCard video={featuredVideo} locale={loc} variant="large" />
                  </Link>
                </div>
              )}
              <div className="lg:w-72 space-y-4">
                {sideVideos.map((v) => (
                  <Link key={v.id} href="/media" className="flex gap-3 group">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                      <img
                        src={`https://img.youtube.com/vi/${v.youtube_id}/maxresdefault.jpg`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-accent/80 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                        {v[`title_${loc}`] || v.title_ru}
                      </p>
                      {v.published_at && (
                        <p className="text-white/30 text-[10px] mt-1">
                          {new Date(v.published_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── NEWS ── */}
      {news.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bebas text-3xl text-white tracking-widest">{t("nav.news").toUpperCase()}</h2>
            <Link href="/news" className="text-accent text-xs font-bold tracking-wider hover:underline">{t("common.seeAll")}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} locale={loc} variant="default" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
