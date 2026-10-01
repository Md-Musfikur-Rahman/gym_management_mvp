import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DeviceRow } from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export async function listDevices(
  client: SupabaseClient<Database>,
): Promise<DeviceRow[]> {
  const { data, error } = await client
    .from("devices")
    .select("*")
    .order("name", { ascending: true });

  throwOnSupabaseError(error);
  return data ?? [];
}
