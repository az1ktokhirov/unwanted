"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function savePartner(formData: FormData) {
  const userId = await getAdminUserId();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;

  const payload = {
    name,
    logo_url: formData.get("logo_url") as string || null,
    website: formData.get("website") as string || null,
    category: formData.get("category") as string || null,
    description_ru: formData.get("description_ru") as string || null,
    contact_person: formData.get("contact_person") as string || null,
    contact_email: formData.get("contact_email") as string || null,
    contact_phone: formData.get("contact_phone") as string || null,
    contract_start: formData.get("contract_start") as string || null,
    contract_end: formData.get("contract_end") as string || null,
    status: formData.get("status") as string || "active",
    priority: parseInt(formData.get("priority") as string) || 0,
  };

  if (id) {
    const { error } = await adminSupabase.from("partners").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await adminSupabase.from("partners").insert(payload);
    if (error) return { error: error.message };
  }

  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: id ? "update" : "create",
    module: "partners",
    description: `Партнёр ${id ? "обновлён" : "добавлен"}: ${name}`,
    status: "success",
  });

  revalidatePath("/admin/partners");
  return { success: true };
}

export async function deletePartner(id: string) {
  const userId = await getAdminUserId();
  const { data } = await adminSupabase.from("partners").select("name").eq("id", id).single();
  const { error } = await adminSupabase.from("partners").delete().eq("id", id);
  if (error) return { error: error.message };
  await adminSupabase.from("activity_logs").insert({
    admin_user_id: userId,
    action: "delete",
    module: "partners",
    description: `Партнёр удалён: ${data?.name}`,
    status: "success",
  });
  revalidatePath("/admin/partners");
  return { success: true };
}
