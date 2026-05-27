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
    module: "players",
    description: desc,
    entity_id: entityId,
    status: "success",
  });
}

export async function savePlayer(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;

  const payload = {
    name_uz: formData.get("name_uz") as string,
    name_ru: formData.get("name_ru") as string,
    name_en: formData.get("name_en") as string,
    position_uz: formData.get("position_uz") as string,
    position_ru: formData.get("position_ru") as string,
    position_en: formData.get("position_en") as string,
    number: formData.get("number") ? parseInt(formData.get("number") as string) : null,
    photo_url: formData.get("photo_url") as string || null,
    birthdate: formData.get("birthdate") as string || null,
    height_cm: formData.get("height_cm") ? parseInt(formData.get("height_cm") as string) : null,
    weight_kg: formData.get("weight_kg") ? parseInt(formData.get("weight_kg") as string) : null,
    nationality: formData.get("nationality") as string || "Uzbekistan",
    dominant_foot: formData.get("dominant_foot") as string || null,
    joined_date: formData.get("joined_date") as string || null,
    contract_until: formData.get("contract_until") as string || null,
    status: formData.get("status") as string || "active",
    is_active: formData.get("is_active") === "true",
    bio_ru: formData.get("bio_ru") as string || null,
  };

  if (id) {
    const { error } = await adminSupabase.from("players").update(payload).eq("id", id);
    if (error) return { error: error.message };
    await log(userId, "update", `Игрок обновлён: ${payload.name_ru}`, id);
  } else {
    const { data, error } = await adminSupabase.from("players").insert(payload).select("id").single();
    if (error) return { error: error.message };
    await log(userId, "create", `Игрок добавлен: ${payload.name_ru}`, data.id);
  }

  revalidatePath("/admin/players");
  return { success: true };
}

export async function deletePlayer(id: string) {
  const userId = await getAdminUserId();
  const { data } = await adminSupabase.from("players").select("name_ru").eq("id", id).single();
  const { error } = await adminSupabase.from("players").delete().eq("id", id);
  if (error) return { error: error.message };
  await log(userId, "delete", `Игрок удалён: ${data?.name_ru}`, id);
  revalidatePath("/admin/players");
  return { success: true };
}
