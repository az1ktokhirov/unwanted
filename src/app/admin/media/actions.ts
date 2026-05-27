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
    module: "media",
    description: desc,
    entity_id: entityId,
    status: "success",
  });
}

export async function saveMedia(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;
  const youtubeId = formData.get("youtube_id") as string;
  const titleRu = formData.get("title_ru") as string;

  const payload = {
    title_uz: formData.get("title_uz") as string || titleRu,
    title_ru: titleRu,
    title_en: formData.get("title_en") as string || titleRu,
    youtube_id: youtubeId,
    thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    category: formData.get("category") as string || null,
    is_published: formData.get("is_published") === "true",
    is_featured: formData.get("is_featured") === "true",
    duration_seconds: formData.get("duration_seconds") ? parseInt(formData.get("duration_seconds") as string) : null,
    published_at: formData.get("published_at") as string || new Date().toISOString(),
  };

  if (id) {
    const { error } = await adminSupabase.from("media").update(payload).eq("id", id);
    if (error) return { error: error.message };
    await log(userId, "update", `Видео обновлено: ${titleRu}`, id);
  } else {
    const { data, error } = await adminSupabase.from("media").insert(payload).select("id").single();
    if (error) return { error: error.message };
    await log(userId, "create", `Видео добавлено: ${titleRu}`, data.id);
  }

  revalidatePath("/admin/media");
  return { success: true };
}

export async function deleteMedia(id: string) {
  const userId = await getAdminUserId();
  const { data } = await adminSupabase.from("media").select("title_ru").eq("id", id).single();
  const { error } = await adminSupabase.from("media").delete().eq("id", id);
  if (error) return { error: error.message };
  await log(userId, "delete", `Видео удалено: ${data?.title_ru}`, id);
  revalidatePath("/admin/media");
  return { success: true };
}
