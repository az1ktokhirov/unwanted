import { adminSupabase } from "@/lib/supabase/admin";
import PagesClient from "./PagesClient";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  let pages = null;
  try {
    ({ data: pages } = await adminSupabase
      .from("pages")
      .select("*")
      .order("slug"));
  } catch { /* Supabase unavailable */ }

  return <PagesClient initialPages={pages ?? []} />;
}
