import type { LeagueStanding } from "@/types";

interface Props {
  standings: LeagueStanding[];
  maxRows?: number;
}

export default function LeagueTable({ standings, maxRows = 8 }: Props) {
  const rows = standings.slice(0, maxRows);

  if (rows.length === 0) {
    return (
      <div className="bg-secondary rounded-xl border border-white/5 p-6 text-center text-white/20 text-sm">
        Нет данных о таблице
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl border border-white/5 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-3 py-2.5 text-left text-white/30 font-medium w-7">#</th>
            <th className="px-2 py-2.5 text-left text-white/30 font-medium">Команда</th>
            <th className="px-2 py-2.5 text-center text-white/30 font-medium">М</th>
            <th className="px-2 py-2.5 text-center text-white/30 font-medium hidden sm:table-cell">В</th>
            <th className="px-2 py-2.5 text-center text-white/30 font-medium hidden sm:table-cell">Н</th>
            <th className="px-2 py-2.5 text-center text-white/30 font-medium hidden sm:table-cell">П</th>
            <th className="px-2 py-2.5 text-center text-white/30 font-medium hidden sm:table-cell">Г</th>
            <th className="px-3 py-2.5 text-center text-white/30 font-medium font-bold">О</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isUB = row.is_unwanted_boys;
            return (
              <tr
                key={row.id}
                className={`border-b border-white/5 last:border-0 transition-colors ${
                  isUB ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-white/3"
                }`}
              >
                <td className="px-3 py-2.5 text-center">
                  <span className={`${isUB ? "text-accent font-bold" : "text-white/30"}`}>{row.position}</span>
                </td>
                <td className="px-2 py-2.5">
                  <span className={`font-medium truncate max-w-[120px] block ${isUB ? "text-white" : "text-white/70"}`}>
                    {isUB ? "Unwanted Boys" : row.team_name}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-center text-white/50">{row.played}</td>
                <td className="px-2 py-2.5 text-center text-win hidden sm:table-cell">{row.won}</td>
                <td className="px-2 py-2.5 text-center text-draw hidden sm:table-cell">{row.drawn}</td>
                <td className="px-2 py-2.5 text-center text-accent hidden sm:table-cell">{row.lost}</td>
                <td className="px-2 py-2.5 text-center text-white/40 hidden sm:table-cell">
                  {row.goals_for}:{row.goals_against}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`font-bold ${isUB ? "text-accent" : "text-white"}`}>{row.points}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
