import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export function createSupabaseBrowserClient() {
  const { url, publicKey } = getSupabaseEnvironment();
  return createBrowserClient<Database>(url, publicKey);
}
