import { adminSupabase } from "@/lib/supabase/admin";
import PlayersClient from "./PlayersClient";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  let players = null;
  try {
    ({ data: players } = await adminSupabase
      .from("players")
      .select("*")
      .order("number", { ascending: true }));
  } catch { /* Supabase unavailable */ }

  return <PlayersClient initialPlayers={players ?? []} />;
}
