"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import LineupField from "./LineupField";
import type { Match, MatchEvent, MatchStats } from "@/types";

type Tab = "overview" | "stats" | "lineups" | "timeline" | "h2h";

interface LineupPlayer {
  id: string;
  name: string;
  number: number | null;
  position: string;
}

interface PlayerStatRow {
  is_starter: boolean;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  players: { name_ru: string; name_uz: string; number: number | null; position_ru: string; position_uz: string } | null;
}

interface Props {
  match: Match;
  locale: "uz" | "ru" | "en";
  labels: Record<string, string>;
  onClose?: () => void;
}

function ScoreResultBadge({ home, away }: { home: number; away: number }) {
  const cls =
    home > away
      ? "bg-win/20 text-win"
      : home === away
      ? "bg-draw/20 text-draw"
      : "bg-accent/20 text-accent";
  const label = home > away ? "Победа" : home === away ? "Ничья" : "Поражение";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${cls}`}>{label}</span>;
}

function DualBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span className="font-bold text-white">{home}</span>
        <span className="text-white/40 text-[10px] uppercase tracking-wider">{label}</span>
        <span className="font-bold text-white">{away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
        <div className="bg-accent rounded-l-full" style={{ width: `${homePct}%` }} />
        <div className="bg-white/30 rounded-r-full" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}

const EVENT_ICONS: Record<string, string> = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
};

export default function MatchDetailPanel({ match, locale, labels, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [homePlayers, setHomePlayers] = useState<LineupPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<LineupPlayer[]>([]);
  const [h2h, setH2h] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTab("overview");
    const supabase = createClient();

    async function fetchData() {
      const [eventsRes, statsRes, playerStatsRes] = await Promise.all([
        supabase
          .from("match_events")
          .select("*")
          .eq("match_id", match.id)
          .order("minute", { ascending: true }),
        supabase.from("match_stats").select("*").eq("match_id", match.id).single(),
        supabase
          .from("player_stats")
          .select(`is_starter, goals, assists, yellow_cards, red_cards, minutes_played,
            players (name_ru, name_uz, number, position_ru, position_uz)`)
          .eq("match_id", match.id),
      ]);

      setEvents((eventsRes.data as MatchEvent[]) ?? []);
      setMatchStats(statsRes.data ?? null);

      const starters = ((playerStatsRes.data ?? []) as any[]).filter(
        (r: any) => r.is_starter
      ) as PlayerStatRow[];

      setHomePlayers(
        starters.map((r) => ({
          id: Math.random().toString(),
          name: r.players?.name_ru ?? r.players?.name_uz ?? "—",
          number: r.players?.number ?? null,
          position: r.players?.position_ru ?? r.players?.position_uz ?? "",
        }))
      );

      // H2H — find previous matches vs same opponent
      const opponentName =
        match[`opponent_${locale === "en" ? "en" : locale === "ru" ? "ru" : "uz"}`] ||
        match.opponent_ru;
      const h2hRes = await supabase
        .from("matches")
        .select("*")
        .or(
          `opponent_ru.ilike.%${match.opponent_ru}%,opponent_uz.ilike.%${match.opponent_uz}%`
        )
        .neq("id", match.id)
        .eq("status", "finished")
        .order("match_date", { ascending: false })
        .limit(5);

      setH2h((h2hRes.data as Match[]) ?? []);
      setLoading(false);
    }

    fetchData();
  }, [match.id]);

  const opponentName =
    (match as any)[`opponent_${locale}`] || match.opponent_ru;
  const competition =
    (match as any)[`competition_${locale}`] || match.competition_ru;
  const venue = (match as any)[`venue_${locale}`] || match.venue_ru;
  const matchDate = new Date(match.match_date);
  const hasScore = match.score_home != null && match.score_away != null;

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: labels.overview },
    { key: "stats", label: labels.matchStats },
    { key: "lineups", label: labels.lineups },
    { key: "timeline", label: labels.timeline },
    { key: "h2h", label: labels.h2h },
  ];

  return (
    <div className="bg-secondary rounded-xl border border-white/5 overflow-hidden h-full flex flex-col">
      {/* Match header */}
      <div className="px-5 py-5 border-b border-white/5">
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden mb-3 text-white/40 hover:text-white text-xs flex items-center gap-1"
          >
            ← Назад
          </button>
        )}
        <p className="text-accent text-[10px] font-bold tracking-widest uppercase mb-2">{competition}</p>

        {/* Score row */}
        <div className="flex items-center justify-between gap-4">
          {/* UB */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-white font-semibold text-sm text-right">UNWANTED BOYS</span>
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-black">UB</span>
            </div>
          </div>

          {/* Score */}
          <div className="text-center flex-shrink-0">
            {hasScore ? (
              <>
                <div className="font-bebas text-4xl text-white leading-none">
                  {match.score_home} — {match.score_away}
                </div>
                <div className="mt-1">
                  <ScoreResultBadge home={match.score_home!} away={match.score_away!} />
                </div>
              </>
            ) : (
              <div className="font-bebas text-2xl text-white/30 leading-none">
                {matchDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                <div className="text-sm">
                  {matchDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            )}
          </div>

          {/* Opponent */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {match.opponent_logo_url ? (
                <Image src={match.opponent_logo_url} alt={opponentName} width={36} height={36} className="object-contain" />
              ) : (
                <span className="text-white/30 text-xs font-bold">{opponentName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="text-white font-semibold text-sm">{opponentName}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-white/30 text-xs">
          <span>📅 {matchDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}</span>
          {venue && <span>📍 {venue}</span>}
          {match.attendance && <span>👥 {match.attendance.toLocaleString()}</span>}
          {match.referee && <span>🟡 {match.referee}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-3 text-xs font-bold tracking-wider uppercase whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-accent text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading && tab !== "overview" ? (
          <div className="flex items-center justify-center py-12 text-white/30 text-sm">Загрузка...</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="space-y-4">
                {match.highlight_url && (
                  <a
                    href={match.highlight_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent text-sm font-bold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    {labels.watchHighlight}
                  </a>
                )}

                {events.length === 0 && !loading ? (
                  <p className="text-white/30 text-sm text-center py-8">Нет событий матча</p>
                ) : (
                  <div className="space-y-1">
                    {events.map((ev) => {
                      const isHome = ev.team === "home";
                      return (
                        <div
                          key={ev.id}
                          className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/3 ${
                            isHome ? "flex-row" : "flex-row-reverse"
                          }`}
                        >
                          <span className="text-white/30 text-xs w-8 text-center flex-shrink-0">
                            {ev.minute}'
                          </span>
                          <span className="text-base">{EVENT_ICONS[ev.event_type] ?? "•"}</span>
                          <div className={`flex-1 ${isHome ? "text-left" : "text-right"}`}>
                            <p className="text-white text-xs font-medium">{ev.player_name ?? "—"}</p>
                            {ev.description && (
                              <p className="text-white/40 text-[10px]">{ev.description}</p>
                            )}
                          </div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isHome ? "bg-accent/20 text-accent" : "bg-white/10 text-white/40"
                          }`}>
                            {isHome ? "UB" : opponentName.slice(0, 4)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STATS */}
            {tab === "stats" && (
              <div>
                {!matchStats ? (
                  <p className="text-white/30 text-sm text-center py-8">Нет статистики матча</p>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-4">
                      <span className="text-accent">UB</span>
                      <span className="text-white/40">{opponentName}</span>
                    </div>
                    <DualBar label="Владение %" home={matchStats.possession_home} away={matchStats.possession_away} />
                    <DualBar label="Удары" home={matchStats.shots_home} away={matchStats.shots_away} />
                    <DualBar label="В створ" home={matchStats.shots_on_target_home} away={matchStats.shots_on_target_away} />
                    <DualBar label="Угловые" home={matchStats.corners_home} away={matchStats.corners_away} />
                    <DualBar label="Фолы" home={matchStats.fouls_home} away={matchStats.fouls_away} />
                    <DualBar label="ЖК" home={matchStats.yellow_home} away={matchStats.yellow_away} />
                    <DualBar label="КК" home={matchStats.red_home} away={matchStats.red_away} />
                  </div>
                )}
              </div>
            )}

            {/* LINEUPS */}
            {tab === "lineups" && (
              <div>
                {homePlayers.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">Составы не добавлены</p>
                ) : (
                  <LineupField
                    homePlayers={homePlayers}
                    awayPlayers={awayPlayers}
                    homeLabel="UNWANTED BOYS"
                    awayLabel={opponentName}
                  />
                )}
              </div>
            )}

            {/* TIMELINE */}
            {tab === "timeline" && (
              <div>
                {events.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">Нет событий</p>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />
                    {events.map((ev) => (
                      <div key={ev.id} className="relative flex gap-3 mb-4">
                        <div className="absolute -left-4 w-5 h-5 rounded-full bg-secondary border-2 border-white/20 flex items-center justify-center">
                          <span className="text-[8px]">{EVENT_ICONS[ev.event_type] ?? "•"}</span>
                        </div>
                        <div className="flex-1 bg-white/3 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-accent text-xs font-bold">{ev.minute}'</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              ev.team === "home" ? "bg-accent/20 text-accent" : "bg-white/10 text-white/40"
                            }`}>
                              {ev.team === "home" ? "UB" : opponentName.slice(0, 4)}
                            </span>
                          </div>
                          <p className="text-white text-xs mt-0.5">{ev.player_name ?? "—"}</p>
                          {ev.description && <p className="text-white/40 text-[10px] mt-0.5">{ev.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* H2H */}
            {tab === "h2h" && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                  vs {opponentName}
                </p>
                {h2h.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">Нет предыдущих встреч</p>
                ) : (
                  <div className="space-y-2">
                    {h2h.map((m) => {
                      const hasS = m.score_home != null;
                      const isWin = hasS && m.score_home! > m.score_away!;
                      const isDraw = hasS && m.score_home === m.score_away;
                      return (
                        <div key={m.id} className="flex items-center justify-between bg-white/3 rounded-lg px-4 py-3 text-xs">
                          <span className="text-white/40">
                            {new Date(m.match_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "2-digit" })}
                          </span>
                          <span className="font-bebas text-lg text-white">
                            {hasS ? `${m.score_home} : ${m.score_away}` : "— : —"}
                          </span>
                          {hasS && (
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              isWin ? "bg-win/20 text-win" : isDraw ? "bg-draw/20 text-draw" : "bg-accent/20 text-accent"
                            }`}>
                              {isWin ? "П" : isDraw ? "Н" : "П"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
