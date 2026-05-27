import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Player } from "@/types";

function calcAge(birthdate: string | null) {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const POSITION_SHORT: Record<string, string> = {
  Darvozabon: "GK",
  Himoyachi: "DEF",
  "Yarim himoyachi": "MID",
  Hujumchi: "FWD",
  Вратарь: "GK",
  Защитник: "DEF",
  Полузащитник: "MID",
  Нападающий: "FWD",
  Goalkeeper: "GK",
  Defender: "DEF",
  Midfielder: "MID",
  Forward: "FWD",
};

interface Props {
  player: Player;
  nameLang: "uz" | "ru" | "en";
  positionLang: "uz" | "ru" | "en";
}

export default function PlayerCard({ player, nameLang, positionLang }: Props) {
  const name = player[`name_${nameLang}`] || player.name_uz;
  const position = player[`position_${positionLang}`] || player.position_uz;
  const age = calcAge(player.birthdate);
  const posShort = POSITION_SHORT[position] ?? position.slice(0, 3).toUpperCase();

  return (
    <Link href={`/team/${player.id}`} className="group block">
      <div className="relative bg-secondary rounded-xl overflow-hidden border border-white/5 hover:border-accent/40 transition-colors">
        {/* Photo */}
        <div className="relative h-64 bg-surface overflow-hidden">
          {player.photo_url ? (
            <Image
              src={player.photo_url}
              alt={name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-surface to-secondary">
              <span className="text-white/10 font-bebas text-7xl">
                {player.number ?? "?"}
              </span>
            </div>
          )}

          {/* Gradient overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-secondary to-transparent" />

          {/* Number badge */}
          {player.number != null && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-xs font-black">{player.number}</span>
            </div>
          )}

          {/* Position badge */}
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-white/80 text-[10px] font-bold tracking-wider">
            {posShort}
          </div>
        </div>

        {/* Info */}
        <div className="px-3 pb-3 pt-1">
          <p className="text-white font-semibold text-sm truncate">{name}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-white/50 text-xs">{position}</p>
            {age && <p className="text-white/30 text-xs">{age} лет</p>}
          </div>

          {/* Status dot */}
          {player.status !== "active" && (
            <span
              className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                player.status === "injured"
                  ? "bg-red-500/20 text-red-400"
                  : player.status === "reserve"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {player.status === "injured" ? "Травма" : player.status === "reserve" ? "Запас" : "Неактив."}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
