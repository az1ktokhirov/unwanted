"use client";

interface LineupPlayer {
  id: string;
  name: string;
  number: number | null;
  position: string;
}

interface Props {
  homePlayers: LineupPlayer[];
  awayPlayers: LineupPlayer[];
  homeLabel: string;
  awayLabel: string;
}

type Row = LineupPlayer[];

function groupByPosition(players: LineupPlayer[]): Row[] {
  const gk = players.filter((p) => /gk|вратарь|darvozabon|goalkeeper/i.test(p.position));
  const def = players.filter((p) => /def|защитник|himoyachi|defender/i.test(p.position));
  const mid = players.filter((p) => /mid|полузащитник|yarim|midfielder/i.test(p.position));
  const fwd = players.filter((p) => /fwd|нападающий|hujumchi|forward/i.test(p.position));
  const other = players.filter((p) => !gk.includes(p) && !def.includes(p) && !mid.includes(p) && !fwd.includes(p));
  return [gk, def, mid, fwd.concat(other)].filter((r) => r.length > 0);
}

function PlayerDot({
  player,
  cx,
  cy,
  color,
}: {
  player: LineupPlayer;
  cx: number;
  cy: number;
  color: string;
}) {
  const short = player.name.split(" ").pop()?.slice(0, 9) ?? player.name.slice(0, 9);
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.9} />
      {player.number != null && (
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="white" fontWeight="700">
          {player.number}
        </text>
      )}
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize={8} fill="white" opacity={0.8}>
        {short}
      </text>
    </g>
  );
}

function renderRows(rows: Row[], startY: number, stepY: number, fieldW: number, color: string) {
  return rows.map((row, ri) => {
    const y = startY + ri * stepY;
    const count = row.length;
    return row.map((player, pi) => {
      const x = (fieldW / (count + 1)) * (pi + 1);
      return <PlayerDot key={player.id} player={player} cx={x} cy={y} color={color} />;
    });
  });
}

export default function LineupField({ homePlayers, awayPlayers, homeLabel, awayLabel }: Props) {
  const W = 340;
  const H = 520;
  const homeRows = groupByPosition(homePlayers);
  const awayRows = groupByPosition(awayPlayers).reverse();

  const homeStartY = H - 50;
  const awayStartY = 50;
  const rowStep = -65;
  const awayRowStep = 65;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-sm mx-auto"
        style={{ background: "transparent" }}
      >
        {/* Pitch */}
        <rect x={20} y={10} width={W - 40} height={H - 20} rx={6} fill="#1a6b2a" />
        <rect x={20} y={10} width={W - 40} height={H - 20} rx={6} fill="none" stroke="#2d8c3e" strokeWidth={1.5} />

        {/* Centre line */}
        <line x1={20} y1={H / 2} x2={W - 20} y2={H / 2} stroke="#2d8c3e" strokeWidth={1} />
        {/* Centre circle */}
        <circle cx={W / 2} cy={H / 2} r={45} fill="none" stroke="#2d8c3e" strokeWidth={1} />
        <circle cx={W / 2} cy={H / 2} r={2} fill="#2d8c3e" />

        {/* Home penalty area */}
        <rect x={90} y={H - 100} width={160} height={90} fill="none" stroke="#2d8c3e" strokeWidth={1} />
        <rect x={120} y={H - 55} width={100} height={45} fill="none" stroke="#2d8c3e" strokeWidth={1} />

        {/* Away penalty area */}
        <rect x={90} y={10} width={160} height={90} fill="none" stroke="#2d8c3e" strokeWidth={1} />
        <rect x={120} y={10} width={100} height={45} fill="none" stroke="#2d8c3e" strokeWidth={1} />

        {/* Team labels */}
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="#e94560" fontWeight="700" letterSpacing={1}>
          {homeLabel.toUpperCase()}
        </text>
        <text x={W / 2} y={22} textAnchor="middle" fontSize={9} fill="#9ca3af" fontWeight="700" letterSpacing={1}>
          {awayLabel.toUpperCase()}
        </text>

        {/* Home players (bottom half) */}
        {renderRows(homeRows, homeStartY, rowStep, W, "#e94560")}

        {/* Away players (top half) */}
        {renderRows(awayRows, awayStartY, awayRowStep, W, "#4b5563")}
      </svg>
    </div>
  );
}
