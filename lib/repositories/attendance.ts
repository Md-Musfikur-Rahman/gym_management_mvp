import type { SupabaseClient } from "@supabase/supabase-js";
import type { AttendanceRow, Database } from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export async function findOpenAttendance(
  client: SupabaseClient<Database>,
  memberId: string,
): Promise<AttendanceRow | null> {
  const { data, error } = await client
    .from("attendance")
    .select("*")
    .eq("member_id", memberId)
    .eq("event_type", "CHECK_IN")
    .eq("status", "SUCCESS")
    .is("check_out_at", null)
    .maybeSingle();

  throwOnSupabaseError(error);
  return data;
}

export async function createAttendance(
  client: SupabaseClient<Database>,
  attendance: Pick<AttendanceRow, "member_id" | "method" | "created_by"> &
    Partial<Pick<AttendanceRow, "device_id" | "check_in_at">>,
): Promise<AttendanceRow> {
  const { data, error } = await client
    .from("attendance")
    .insert({ ...attendance, event_type: "CHECK_IN", status: "SUCCESS" })
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Attendance insert returned no record.");
  return data;
}

export async function closeAttendance(
  client: SupabaseClient<Database>,
  attendanceId: string,
  checkedOutAt: string,
): Promise<AttendanceRow> {
  const { data, error } = await client
    .from("attendance")
    .update({ event_type: "CHECK_OUT", check_out_at: checkedOutAt })
    .eq("id", attendanceId)
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Check-out update returned no record.");
  return data;
}

export async function listAttendance(
  client: SupabaseClient<Database>,
  memberId?: string,
): Promise<AttendanceRow[]> {
  let query = client
    .from("attendance")
    .select("*")
    .order("check_in_at", { ascending: false });

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query;
  throwOnSupabaseError(error);
  return data ?? [];
}
