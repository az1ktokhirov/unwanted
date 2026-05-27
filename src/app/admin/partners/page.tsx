import { adminSupabase } from "@/lib/supabase/admin";
import PartnersClient from "./PartnersClient";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const { data: partners } = await adminSupabase
    .from("partners")
    .select("*")
    .order("priority", { ascending: false });

  return <PartnersClient initialPartners={partners ?? []} />;
}
