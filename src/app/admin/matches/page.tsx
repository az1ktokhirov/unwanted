import { adminSupabase } from "@/lib/supabase/admin";
import MatchesClient from "./MatchesClient";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const { data: matches } = await adminSupabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: false });

  return <MatchesClient initialMatches={matches ?? []} />;
}
