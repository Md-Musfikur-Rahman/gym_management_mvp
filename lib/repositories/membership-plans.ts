import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  MembershipPlanRow,
} from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export type NewMembershipPlan = Pick<
  MembershipPlanRow,
  "name" | "duration_days" | "price"
> &
  Partial<Pick<MembershipPlanRow, "description" | "status">>;

export async function createMembershipPlan(
  client: SupabaseClient<Database>,
  plan: NewMembershipPlan,
): Promise<MembershipPlanRow> {
  const { data, error } = await client
    .from("membership_plans")
    .insert(plan)
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Membership plan insert returned no record.");
  return data;
}

export async function listMembershipPlans(
  client: SupabaseClient<Database>,
): Promise<MembershipPlanRow[]> {
  const { data, error } = await client
    .from("membership_plans")
    .select("*")
    .order("duration_days", { ascending: true });

  throwOnSupabaseError(error);
  return data ?? [];
}
