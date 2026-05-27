import { adminSupabase } from "@/lib/supabase/admin";
import MediaClient from "./MediaClient";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { data: media } = await adminSupabase
    .from("media")
    .select("*")
    .order("published_at", { ascending: false });

  return <MediaClient initialMedia={media ?? []} />;
}
