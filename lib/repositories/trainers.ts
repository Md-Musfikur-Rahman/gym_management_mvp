import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TrainerRow } from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export async function findTrainerByProfileId(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<TrainerRow | null> {
  const { data, error } = await client
    .from("trainers")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  throwOnSupabaseError(error);
  return data;
}

export async function listTrainers(
  client: SupabaseClient<Database>,
): Promise<TrainerRow[]> {
  const { data, error } = await client
    .from("trainers")
    .select("*")
    .order("name", { ascending: true });

  throwOnSupabaseError(error);
  return data ?? [];
}
