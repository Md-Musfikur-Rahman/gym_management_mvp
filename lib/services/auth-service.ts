import { redirect } from "next/navigation";
import { findProfileById } from "@/lib/repositories/profiles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";

export const roleHome: Record<AppRole, string> = {
  ADMIN: "/admin",
  TRAINER: "/trainer",
  MEMBER: "/member",
};

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw new Error(error.message);
  }
  if (!data.user) {
    return null;
  }

  return findProfileById(supabase, data.user.id);
}

export async function requireRole(role: AppRole): Promise<ProfileRow> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== role) {
    redirect(roleHome[profile.role]);
  }

  return profile;
}
