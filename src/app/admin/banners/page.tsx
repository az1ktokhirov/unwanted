import { adminSupabase } from "@/lib/supabase/admin";
import BannersClient from "./BannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const { data: banners } = await adminSupabase
    .from("banners")
    .select("*")
    .order("priority", { ascending: false });

  return <BannersClient initialBanners={banners ?? []} />;
}
