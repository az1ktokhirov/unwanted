import { adminSupabase } from "@/lib/supabase/admin";
import PlayersClient from "./PlayersClient";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const { data: players } = await adminSupabase
    .from("players")
    .select("*")
    .order("number", { ascending: true });

  return <PlayersClient initialPlayers={players ?? []} />;
}
