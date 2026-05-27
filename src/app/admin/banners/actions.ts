"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveBanner(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;

  const payload = {
    name,
    image_url: formData.get("image_url") as string || null,
    link_url: formData.get("link_url") as string || null,
    placement: formData.get("placement") as string,
    type: formData.get("type") as string || "image",
    status: formData.get("status") as string || "active",
    start_date: formData.get("start_date") as string || null,
    end_date: formData.get("end_date") as string || null,
    priority: parseInt(formData.get("priority") as string) || 0,
    device: formData.get("device") as string || "all",
  };

  if (id) {
    const { error } = await adminSupabase.from("banners").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await adminSupabase.from("banners").insert(payload);
    if (error) return { error: error.message };
  }

  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: id ? "update" : "create",
    module: "banners",
    description: `Баннер ${id ? "обновлён" : "добавлен"}: ${name}`,
    status: "success",
  });

  revalidatePath("/admin/banners");
  return { success: true };
}

export async function deleteBanner(id: string) {
  const userId = await getAdminUserId();
  const { data } = await adminSupabase.from("banners").select("name").eq("id", id).single();
  const { error } = await adminSupabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };
  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: "delete",
    module: "banners",
    description: `Баннер удалён: ${data?.name}`,
    status: "success",
  });
  revalidatePath("/admin/banners");
  return { success: true };
}
