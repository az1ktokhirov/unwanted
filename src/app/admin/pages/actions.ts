"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function savePage(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;
  const slug = formData.get("slug") as string;

  const payload = {
    slug,
    title_uz: formData.get("title_uz") as string,
    title_ru: formData.get("title_ru") as string,
    title_en: formData.get("title_en") as string,
    content_uz: formData.get("content_uz") as string || null,
    content_ru: formData.get("content_ru") as string || null,
    content_en: formData.get("content_en") as string || null,
    cover_url: formData.get("cover_url") as string || null,
    is_published: formData.get("is_published") === "true",
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await adminSupabase.from("pages").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await adminSupabase.from("pages").insert(payload);
    if (error) return { error: error.message };
  }

  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: id ? "update" : "create",
    module: "pages",
    description: `Страница обновлена: ${slug}`,
    status: "success",
  });

  revalidatePath("/admin/pages");
  return { success: true };
}
