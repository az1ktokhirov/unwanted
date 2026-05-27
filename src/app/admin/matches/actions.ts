"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function log(userId: string | null, action: string, desc: string, entityId?: string) {
  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action,
    module: "matches",
    description: desc,
    entity_id: entityId,
    status: "success",
  });
}

export async function saveMatch(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;

  const payload = {
    opponent_uz: formData.get("opponent_uz") as string,
    opponent_ru: formData.get("opponent_ru") as string,
    opponent_en: formData.get("opponent_en") as string,
    opponent_logo_url: formData.get("opponent_logo_url") as string || null,
    match_date: formData.get("match_date") as string,
    venue_ru: formData.get("venue_ru") as string || null,
    stadium: formData.get("stadium") as string || null,
    competition_ru: formData.get("competition_ru") as string || null,
    season: formData.get("season") as string || "2026",
    round: formData.get("round") as string || null,
    score_home: formData.get("score_home") ? parseInt(formData.get("score_home") as string) : null,
    score_away: formData.get("score_away") ? parseInt(formData.get("score_away") as string) : null,
    status: formData.get("status") as string || "upcoming",
    highlight_url: formData.get("highlight_url") as string || null,
    attendance: formData.get("attendance") ? parseInt(formData.get("attendance") as string) : null,
    referee: formData.get("referee") as string || null,
  };

  if (id) {
    const { error } = await adminSupabase.from("matches").update(payload).eq("id", id);
    if (error) return { error: error.message };
    await log(userId, "update", `Матч обновлён: UB vs ${payload.opponent_ru}`, id);
  } else {
    const { data, error } = await adminSupabase.from("matches").insert(payload).select("id").single();
    if (error) return { error: error.message };
    await log(userId, "create", `Матч создан: UB vs ${payload.opponent_ru}`, data.id);
  }

  revalidatePath("/admin/matches");
  return { success: true };
}

export async function deleteMatch(id: string) {
  const userId = await getAdminUserId();
  const { data } = await adminSupabase.from("matches").select("opponent_ru").eq("id", id).single();
  const { error } = await adminSupabase.from("matches").delete().eq("id", id);
  if (error) return { error: error.message };
  await log(userId, "delete", `Матч удалён: UB vs ${data?.opponent_ru}`, id);
  revalidatePath("/admin/matches");
  return { success: true };
}

export async function saveMatchStats(formData: FormData) {
  const matchId = formData.get("match_id") as string;
  const payload = {
    match_id: matchId,
    possession_home: parseInt(formData.get("possession_home") as string) || 0,
    possession_away: parseInt(formData.get("possession_away") as string) || 0,
    shots_home: parseInt(formData.get("shots_home") as string) || 0,
    shots_away: parseInt(formData.get("shots_away") as string) || 0,
    shots_on_target_home: parseInt(formData.get("shots_on_target_home") as string) || 0,
    shots_on_target_away: parseInt(formData.get("shots_on_target_away") as string) || 0,
    corners_home: parseInt(formData.get("corners_home") as string) || 0,
    corners_away: parseInt(formData.get("corners_away") as string) || 0,
    fouls_home: parseInt(formData.get("fouls_home") as string) || 0,
    fouls_away: parseInt(formData.get("fouls_away") as string) || 0,
    yellow_home: parseInt(formData.get("yellow_home") as string) || 0,
    yellow_away: parseInt(formData.get("yellow_away") as string) || 0,
    red_home: parseInt(formData.get("red_home") as string) || 0,
    red_away: parseInt(formData.get("red_away") as string) || 0,
  };

  const { error } = await adminSupabase.from("match_stats").upsert(payload, { onConflict: "match_id" });
  if (error) return { error: error.message };
  revalidatePath("/admin/matches");
  return { success: true };
}

export async function saveMatchEvent(formData: FormData) {
  const id = formData.get("id") as string | null;
  const matchId = formData.get("match_id") as string;
  const payload = {
    match_id: matchId,
    minute: parseInt(formData.get("minute") as string),
    extra_time: parseInt(formData.get("extra_time") as string) || 0,
    event_type: formData.get("event_type") as string,
    team: formData.get("team") as string,
    player_name: formData.get("player_name") as string || null,
    description: formData.get("description") as string || null,
  };

  if (id) {
    const { error } = await adminSupabase.from("match_events").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await adminSupabase.from("match_events").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/matches");
  return { success: true };
}

export async function deleteMatchEvent(id: string) {
  const { error } = await adminSupabase.from("match_events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/matches");
  return { success: true };
}
