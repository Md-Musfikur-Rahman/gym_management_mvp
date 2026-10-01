import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MemberRow } from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export type NewMember = Pick<MemberRow, "member_code" | "name" | "phone"> &
  Partial<Pick<MemberRow, "email" | "trainer_id" | "joined_at" | "status">>;

export async function createMember(
  client: SupabaseClient<Database>,
  member: NewMember,
): Promise<MemberRow> {
  const { data, error } = await client
    .from("members")
    .insert(member)
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Member insert returned no record.");
  return data;
}

export async function listMembers(
  client: SupabaseClient<Database>,
): Promise<MemberRow[]> {
  const { data, error } = await client
    .from("members")
    .select("*")
    .order("name", { ascending: true });

  throwOnSupabaseError(error);
  return data ?? [];
}

export async function findMemberById(
  client: SupabaseClient<Database>,
  memberId: string,
): Promise<MemberRow | null> {
  const { data, error } = await client
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  throwOnSupabaseError(error);
  return data;
}

export async function findMemberByCode(
  client: SupabaseClient<Database>,
  memberCode: string,
): Promise<MemberRow | null> {
  const { data, error } = await client
    .from("members")
    .select("*")
    .eq("member_code", memberCode)
    .maybeSingle();

  throwOnSupabaseError(error);
  return data;
}

export async function findMemberByProfileId(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<MemberRow | null> {
  const { data, error } = await client
    .from("members")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  throwOnSupabaseError(error);
  return data;
}
