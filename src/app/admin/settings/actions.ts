"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveSettings(formData: FormData) {
  const userId = await getAdminUserId();
  const keys = [
    "site_name",
    "club_motto_ru",
    "founded_year",
    "social_youtube",
    "social_instagram",
    "social_telegram",
    "social_tiktok",
    "contact_email",
    "contact_phone",
    "address",
    "copyright_text",
  ];

  const upserts = keys.map((key) => ({
    key,
    value_ru: formData.get(key) as string || null,
  }));

  const { error } = await adminSupabase.from("site_settings").upsert(upserts, { onConflict: "key" });
  if (error) return { error: error.message };

  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: "update",
    module: "settings",
    description: "Настройки сайта обновлены",
    status: "success",
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
