"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/services/auth-service";
import {
  checkInMember,
  checkOutMember,
  parseMemberQr,
  type AttendanceResult,
} from "@/lib/services/attendance-service";
import { listAttendance } from "@/lib/repositories/attendance";
import { listMembers } from "@/lib/repositories/members";
import { listDevices } from "@/lib/repositories/devices";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function recordManualCheckIn(
  formData: FormData,
): Promise<AttendanceResult> {
  const profile = await requireRole("ADMIN");
  const supabase = await createSupabaseServerClient();
  const memberCode = String(formData.get("memberCode") ?? "")
    .trim()
    .toUpperCase();
  const result = await checkInMember(supabase, {
    memberCode,
    method: "MANUAL",
    createdBy: profile.id,
  });
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/attendance");
  }
  return result;
}

export async function recordQrCheckIn(
  payload: string,
): Promise<AttendanceResult> {
  const profile = await requireRole("ADMIN");
  const memberCode = parseMemberQr(payload);
  if (!memberCode) {
    return {
      ok: false,
      code: "MEMBER_NOT_FOUND",
      message: "This QR code is not a recognized gym member code.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await checkInMember(supabase, {
    memberCode,
    method: "QR",
    createdBy: profile.id,
  });
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/attendance");
  }
  return result;
}

export async function recordDeviceCheckIn(
  memberId: string,
  deviceId: string,
  credentialType: "ACCESS_CARD" | "PIN",
): Promise<AttendanceResult> {
  const profile = await requireRole("ADMIN");
  if (credentialType !== "ACCESS_CARD" && credentialType !== "PIN") {
    return {
      ok: false,
      code: "MEMBER_NOT_FOUND",
      message: "Only non-biometric credentials are supported.",
    };
  }
  const supabase = await createSupabaseServerClient();
  const result = await checkInMember(supabase, {
    memberId,
    method: "ZKTECO",
    createdBy: profile.id,
    deviceId,
  });
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/devices");
  }
  return result;
}

export async function recordCheckOut(
  memberId: string,
): Promise<AttendanceResult> {
  await requireRole("ADMIN");
  const supabase = await createSupabaseServerClient();
  const result = await checkOutMember(supabase, memberId);
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/attendance");
  }
  return result;
}

export async function getAdminAttendanceData() {
  await requireRole("ADMIN");
  const supabase = await createSupabaseServerClient();
  const [attendance, members] = await Promise.all([
    listAttendance(supabase),
    listMembers(supabase),
  ]);
  const memberById = new Map(members.map((member) => [member.id, member]));
  return {
    rows: attendance.map((row) => ({
      ...row,
      member: memberById.get(row.member_id) ?? null,
    })),
  };
}

export async function getAdminDeviceData() {
  await requireRole("ADMIN");
  const supabase = await createSupabaseServerClient();
  const [members, devices] = await Promise.all([
    listMembers(supabase),
    listDevices(supabase),
  ]);
  return { members, devices };
}
