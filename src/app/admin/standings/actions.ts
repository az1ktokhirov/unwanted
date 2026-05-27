"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveStanding(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;

  const payload = {
    season: formData.get("season") as string,
    competition: formData.get("competition") as string,
    team_name: formData.get("team_name") as string,
    team_logo_url: formData.get("team_logo_url") as string || null,
    is_unwanted_boys: formData.get("is_unwanted_boys") === "true",
    position: parseInt(formData.get("position") as string) || 1,
    played: parseInt(formData.get("played") as string) || 0,
    won: parseInt(formData.get("won") as string) || 0,
    drawn: parseInt(formData.get("drawn") as string) || 0,
    lost: parseInt(formData.get("lost") as string) || 0,
    goals_for: parseInt(formData.get("goals_for") as string) || 0,
    goals_against: parseInt(formData.get("goals_against") as string) || 0,
    points: parseInt(formData.get("points") as string) || 0,
  };

  if (id) {
    const { error } = await adminSupabase.from("league_standings").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await adminSupabase.from("league_standings").insert(payload);
    if (error) return { error: error.message };
  }

  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: id ? "update" : "create",
    module: "standings",
    description: `Таблица обновлена: ${payload.team_name}`,
    status: "success",
  });

  revalidatePath("/admin/standings");
  return { success: true };
}

export async function deleteStanding(id: string) {
  const userId = await getAdminUserId();
  const { error } = await adminSupabase.from("league_standings").delete().eq("id", id);
  if (error) return { error: error.message };
  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: "delete",
    module: "standings",
    description: "Строка таблицы удалена",
    status: "success",
  });
  revalidatePath("/admin/standings");
  return { success: true };
}
