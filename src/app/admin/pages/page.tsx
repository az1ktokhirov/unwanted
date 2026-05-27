import { adminSupabase } from "@/lib/supabase/admin";
import PagesClient from "./PagesClient";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const { data: pages } = await adminSupabase
    .from("pages")
    .select("*")
    .order("slug");

  return <PagesClient initialPages={pages ?? []} />;
}
