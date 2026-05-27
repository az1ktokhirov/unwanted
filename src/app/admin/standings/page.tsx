import { adminSupabase } from "@/lib/supabase/admin";
import StandingsClient from "./StandingsClient";

export const dynamic = "force-dynamic";

export default async function AdminStandingsPage() {
  const { data: standings } = await adminSupabase
    .from("league_standings")
    .select("*")
    .order("season", { ascending: false })
    .order("position", { ascending: true });

  return <StandingsClient initialStandings={standings ?? []} />;
}
