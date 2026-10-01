import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MembershipRow } from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export type NewMembership = Pick<
  MembershipRow,
  | "member_id"
  | "plan_id"
  | "start_date"
  | "end_date"
  | "price"
  | "discount"
  | "final_amount"
> &
  Partial<Pick<MembershipRow, "status">>;

export async function createMembership(
  client: SupabaseClient<Database>,
  membership: NewMembership,
): Promise<MembershipRow> {
  const { data, error } = await client
    .from("memberships")
    .insert(membership)
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Membership insert returned no record.");
  return data;
}

export async function listMemberships(
  client: SupabaseClient<Database>,
  memberId?: string,
): Promise<MembershipRow[]> {
  let query = client
    .from("memberships")
    .select("*")
    .order("start_date", { ascending: false });

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query;
  throwOnSupabaseError(error);
  return data ?? [];
}
