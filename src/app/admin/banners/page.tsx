import { adminSupabase } from "@/lib/supabase/admin";
import BannersClient from "./BannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  let banners = null;
  try {
    ({ data: banners } = await adminSupabase
      .from("banners")
      .select("*")
      .order("priority", { ascending: false }));
  } catch { /* Supabase unavailable */ }

  return <BannersClient initialBanners={banners ?? []} />;
}
