"use client";

import { useState } from "react";
import PlayerCard from "./PlayerCard";
import type { Player } from "@/types";

type Tab = "squad" | "coaches" | "medical";
type PositionFilter = "all" | "gk" | "def" | "mid" | "fwd";

const GK_TERMS = ["darvozabon", "вратарь", "goalkeeper"];
const DEF_TERMS = ["himoyachi", "защитник", "defender"];
const MID_TERMS = ["yarim himoyachi", "полузащитник", "midfielder"];
const FWD_TERMS = ["hujumchi", "нападающий", "forward"];

function getPositionKey(position: string): PositionFilter {
  const p = position.toLowerCase();
  if (GK_TERMS.some((t) => p.includes(t))) return "gk";
  if (DEF_TERMS.some((t) => p.includes(t))) return "def";
  if (MID_TERMS.some((t) => p.includes(t))) return "mid";
  if (FWD_TERMS.some((t) => p.includes(t))) return "fwd";
  return "all";
}

interface Props {
  players: Player[];
  locale: "uz" | "ru" | "en";
  labels: {
    squad: string;
    coaches: string;
    medical: string;
    all: string;
    gk: string;
    def: string;
    mid: string;
    fwd: string;
    byNumber: string;
    noPlayers: string;
  };
}

export default function TeamFilters({ players, locale, labels }: Props) {
  const [tab, setTab] = useState<Tab>("squad");
  const [posFilter, setPosFilter] = useState<PositionFilter>("all");
  const [sortByNumber, setSortByNumber] = useState(false);

  const nameLang = locale;
  const posLang = locale;

  const squadPlayers = players.filter((p) => {
    const pos = (p[`position_${locale}`] || p.position_uz).toLowerCase();
    return GK_TERMS.some((t) => pos.includes(t)) ||
      DEF_TERMS.some((t) => pos.includes(t)) ||
      MID_TERMS.some((t) => pos.includes(t)) ||
      FWD_TERMS.some((t) => pos.includes(t));
  });

  const otherPlayers = players.filter((p) => {
    const pos = (p[`position_${locale}`] || p.position_uz).toLowerCase();
    return !GK_TERMS.some((t) => pos.includes(t)) &&
      !DEF_TERMS.some((t) => pos.includes(t)) &&
      !MID_TERMS.some((t) => pos.includes(t)) &&
      !FWD_TERMS.some((t) => pos.includes(t));
  });

  let displayed = tab === "squad" ? squadPlayers : otherPlayers;

  if (tab === "squad" && posFilter !== "all") {
    displayed = displayed.filter(
      (p) => getPositionKey(p[`position_${locale}`] || p.position_uz) === posFilter
    );
  }

  if (sortByNumber) {
    displayed = [...displayed].sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/10 pb-0">
        {(["squad", "coaches", "medical"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPosFilter("all"); }}
            className={`px-4 py-2.5 text-xs font-bold tracking-widest uppercase border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-accent text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      {/* Position filters + sort (squad tab only) */}
      {tab === "squad" && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(["all", "gk", "def", "mid", "fwd"] as PositionFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPosFilter(f)}
              className={`px-3 py-1 rounded text-xs font-bold tracking-widest uppercase transition-colors ${
                posFilter === f
                  ? "bg-accent text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {labels[f]}
            </button>
          ))}
          <button
            onClick={() => setSortByNumber(!sortByNumber)}
            className={`ml-auto px-3 py-1 rounded text-xs font-bold tracking-widest uppercase transition-colors ${
              sortByNumber
                ? "bg-accent/20 text-accent border border-accent/40"
                : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            # {labels.byNumber}
          </button>
        </div>
      )}

      {/* Grid */}
      {displayed.length === 0 ? (
        <p className="text-white/30 text-sm py-12 text-center">{labels.noPlayers}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayed.map((p) => (
            <PlayerCard key={p.id} player={p} nameLang={nameLang} positionLang={posLang} />
          ))}
        </div>
      )}
    </div>
  );
}
