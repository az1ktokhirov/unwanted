import { adminSupabase } from "@/lib/supabase/admin";
import PartnersClient from "./PartnersClient";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  let partners = null;
  try {
    ({ data: partners } = await adminSupabase
      .from("partners")
      .select("*")
      .order("priority", { ascending: false }));
  } catch { /* Supabase unavailable */ }

  return <PartnersClient initialPartners={partners ?? []} />;
}
