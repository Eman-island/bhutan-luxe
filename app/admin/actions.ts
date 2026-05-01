"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const ALLOWED_STATUSES = new Set(["new", "contacted", "won", "lost"]);

export async function updateInquiryStatus(id: string, status: string) {
  if (!ALLOWED_STATUSES.has(status)) {
    return { ok: false, error: "Invalid status" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("[admin-status-update]", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin");
  return { ok: true };
}
