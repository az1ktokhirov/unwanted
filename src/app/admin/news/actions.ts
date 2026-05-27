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
    module: "news",
    description: desc,
    entity_id: entityId,
    status: "success",
  });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80) + "-" + Date.now().toString(36);
}

export async function saveNews(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;
  const titleRu = formData.get("title_ru") as string;
  const rawSlug = formData.get("slug") as string;

  const payload: Record<string, any> = {
    title_uz: formData.get("title_uz") as string,
    title_ru: titleRu,
    title_en: formData.get("title_en") as string,
    body_uz: formData.get("body_uz") as string || null,
    body_ru: formData.get("body_ru") as string || null,
    body_en: formData.get("body_en") as string || null,
    excerpt_ru: formData.get("excerpt_ru") as string || null,
    cover_url: formData.get("cover_url") as string || null,
    slug: rawSlug || slugify(titleRu),
    category: formData.get("category") as string || null,
    status: formData.get("status") as string || "draft",
    tags: (formData.get("tags") as string || "").split(",").map((t) => t.trim()).filter(Boolean),
  };

  const scheduledAt = formData.get("published_at") as string;
  if (scheduledAt) payload.published_at = scheduledAt;
  else if (payload.status === "published") payload.published_at = new Date().toISOString();

  if (id) {
    const { error } = await adminSupabase.from("news").update(payload).eq("id", id);
    if (error) return { error: error.message };
    await log(userId, payload.status === "published" ? "publish" : "update", `Новость обновлена: ${titleRu}`, id);
  } else {
    payload.author_id = userId;
    const { data, error } = await adminSupabase.from("news").insert(payload).select("id").single();
    if (error) return { error: error.message };
    await log(userId, "create", `Новость создана: ${titleRu}`, data.id);
  }

  revalidatePath("/admin/news");
  revalidatePath("/[locale]/news");
  return { success: true };
}

export async function deleteNews(id: string) {
  const userId = await getAdminUserId();
  const { data } = await adminSupabase.from("news").select("title_ru").eq("id", id).single();
  const { error } = await adminSupabase.from("news").delete().eq("id", id);
  if (error) return { error: error.message };
  await log(userId, "delete", `Новость удалена: ${data?.title_ru}`, id);
  revalidatePath("/admin/news");
  return { success: true };
}
