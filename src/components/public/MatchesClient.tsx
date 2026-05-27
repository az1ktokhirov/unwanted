"use client";

import { useState } from "react";
import Image from "next/image";
import MatchDetailPanel from "./MatchDetailPanel";
import type { Match } from "@/types";

type Tab = "upcoming" | "previous";

interface Props {
  upcomingMatches: Match[];
  previousMatches: Match[];
  locale: "uz" | "ru" | "en";
  labels: Record<string, string>;
}

function MatchRow({
  match,
  locale,
  isSelected,
  onClick,
}: {
  match: Match;
  locale: "uz" | "ru" | "en";
  isSelected: boolean;
  onClick: () => void;
}) {
  const opponentName = (match as any)[`opponent_${locale}`] || match.opponent_ru;
  const competition = (match as any)[`competition_${locale}`] || match.competition_ru;
  const hasScore = match.score_home != null && match.score_away != null;
  const matchDate = new Date(match.match_date);

  let resultClass = "";
  let resultLabel = "";
  if (hasScore) {
    if (match.score_home! > match.score_away!) {
      resultClass = "text-win";
      resultLabel = "W";
    } else if (match.score_home === match.score_away) {
      resultClass = "text-draw";
      resultLabel = "D";
    } else {
      resultClass = "text-accent";
      resultLabel = "L";
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
        isSelected ? "bg-white/8 border-l-2 border-l-accent" : ""
      }`}
    >
      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">
        {matchDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} · {competition}
      </p>
      <div className="flex items-center justify-between gap-3">
        {/* UB side */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent text-[10px] font-black">UB</span>
          </div>
          <span className="text-white text-xs font-semibold truncate">Unwanted Boys</span>
        </div>

        {/* Score / vs */}
        <div className="text-center flex-shrink-0">
          {hasScore ? (
            <div className="flex items-center gap-1">
              <span className="font-bebas text-xl text-white leading-none">{match.score_home}</span>
              <span className="text-white/30 text-sm">:</span>
              <span className="font-bebas text-xl text-white leading-none">{match.score_away}</span>
            </div>
          ) : (
            <span className="text-white/30 text-xs">vs</span>
          )}
        </div>

        {/* Opponent side */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-white text-xs font-semibold truncate text-right">{opponentName}</span>
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {match.opponent_logo_url ? (
              <Image src={match.opponent_logo_url} alt={opponentName} width={28} height={28} className="object-contain" />
            ) : (
              <span className="text-white/30 text-[10px] font-bold">{opponentName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Result badge */}
        {resultLabel && (
          <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${resultClass}`}>{resultLabel}</span>
        )}
      </div>
    </button>
  );
}

export default function MatchesClient({ upcomingMatches, previousMatches, locale, labels }: Props) {
  const [tab, setTab] = useState<Tab>(upcomingMatches.length > 0 ? "upcoming" : "previous");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(
    upcomingMatches[0] ?? previousMatches[0] ?? null
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const displayed = tab === "upcoming" ? upcomingMatches : previousMatches;

  function selectMatch(m: Match) {
    setSelectedMatch(m);
    setMobileDetailOpen(true);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-[600px]">
      {/* Left: match list */}
      <div className={`lg:w-80 flex-shrink-0 bg-secondary rounded-xl border border-white/5 overflow-hidden ${mobileDetailOpen ? "hidden lg:block" : "block"}`}>
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(["upcoming", "previous"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-accent text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {t === "upcoming" ? labels.upcoming : labels.previous}
              <span className="ml-1.5 text-[10px] opacity-60">
                ({t === "upcoming" ? upcomingMatches.length : previousMatches.length})
              </span>
            </button>
          ))}
        </div>

        {/* Match list */}
        <div className="overflow-y-auto max-h-[600px]">
          {displayed.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-12">{labels.noMatches}</p>
          ) : (
            displayed.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                locale={locale}
                isSelected={selectedMatch?.id === m.id}
                onClick={() => selectMatch(m)}
              />
            ))
          )}
        </div>
      </div>

      {/* Center: detail panel */}
      <div className={`flex-1 lg:ml-4 min-h-[400px] ${!selectedMatch ? "hidden lg:flex" : mobileDetailOpen ? "block" : "hidden lg:block"}`}>
        {selectedMatch ? (
          <MatchDetailPanel
            match={selectedMatch}
            locale={locale}
            labels={labels}
            onClose={() => setMobileDetailOpen(false)}
          />
        ) : (
          <div className="h-full bg-secondary rounded-xl border border-white/5 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">⚽</div>
              <p className="text-white/30 text-sm">{labels.selectMatch}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
