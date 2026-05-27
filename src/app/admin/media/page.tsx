import { adminSupabase } from "@/lib/supabase/admin";
import MediaClient from "./MediaClient";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  let media = null;
  try {
    ({ data: media } = await adminSupabase
      .from("media")
      .select("*")
      .order("published_at", { ascending: false }));
  } catch { /* Supabase unavailable */ }

  return <MediaClient initialMedia={media ?? []} />;
}
