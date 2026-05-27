import { adminSupabase } from "@/lib/supabase/admin";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings = null;
  try {
    ({ data: settings } = await adminSupabase.from("site_settings").select("*"));
  } catch { /* Supabase unavailable */ }

  const map: Record<string, string> = {};
  (settings ?? []).forEach((s: any) => { map[s.key] = s.value_ru ?? ""; });
  return <SettingsClient settings={map} />;
}
