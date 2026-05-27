import { adminSupabase } from "@/lib/supabase/admin";
import MatchesClient from "./MatchesClient";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  let matches = null;
  try {
    ({ data: matches } = await adminSupabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false }));
  } catch { /* Supabase unavailable */ }

  return <MatchesClient initialMatches={matches ?? []} />;
}
