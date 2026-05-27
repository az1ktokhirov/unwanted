interface Props {
  label: string;
  home: number;
  away: number;
  homeLabel?: string;
  awayLabel?: string;
  suffix?: string;
}

export default function StatBar({ label, home, away, homeLabel = "UB", awayLabel, suffix = "" }: Props) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-accent font-semibold">{home}{suffix}</span>
        <span className="text-white/50 text-[10px] uppercase tracking-wider">{label}</span>
        <span className="text-white/60 font-semibold">{away}{suffix}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div className="bg-accent rounded-l-full transition-all duration-500" style={{ width: `${homePct}%` }} />
        <div className="bg-white/20 rounded-r-full transition-all duration-500" style={{ width: `${awayPct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-accent/70">{homeLabel}</span>
        {awayLabel && <span className="text-[10px] text-white/40">{awayLabel}</span>}
      </div>
    </div>
  );
}
