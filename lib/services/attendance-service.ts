import type { SupabaseClient } from "@supabase/supabase-js";
import {
  closeAttendance,
  createAttendance,
  findOpenAttendance,
} from "@/lib/repositories/attendance";
import { findMemberByCode, findMemberById } from "@/lib/repositories/members";
import { listMemberships } from "@/lib/repositories/memberships";
import type {
  AttendanceRow,
  Database,
  MemberRow,
} from "@/lib/supabase/database.types";

export type AttendanceMethod = AttendanceRow["method"];
export type AttendanceResult =
  | { ok: true; code: "SUCCESS"; member: MemberRow; attendance: AttendanceRow }
  | {
      ok: false;
      code:
        | "MEMBER_NOT_FOUND"
        | "MEMBER_SUSPENDED"
        | "NO_ACTIVE_MEMBERSHIP"
        | "ALREADY_CHECKED_IN"
        | "NO_OPEN_CHECK_IN";
      message: string;
    };

function gymToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(
    new Date(),
  );
}

async function validateMember(
  client: SupabaseClient<Database>,
  member: MemberRow,
): Promise<AttendanceResult | null> {
  if (member.status !== "ACTIVE") {
    return {
      ok: false,
      code: "MEMBER_SUSPENDED",
      message: "This member account is not active.",
    };
  }

  const today = gymToday();
  const memberships = await listMemberships(client, member.id);
  const activeMembership = memberships.find(
    (membership) =>
      membership.status === "ACTIVE" &&
      membership.start_date <= today &&
      membership.end_date >= today,
  );
  if (!activeMembership) {
    return {
      ok: false,
      code: "NO_ACTIVE_MEMBERSHIP",
      message: "No valid membership found. Please contact reception.",
    };
  }
  return null;
}

export async function checkInMember(
  client: SupabaseClient<Database>,
  input: {
    memberId?: string;
    memberCode?: string;
    method: AttendanceMethod;
    createdBy: string;
    deviceId?: string;
  },
): Promise<AttendanceResult> {
  const member = input.memberId
    ? await findMemberById(client, input.memberId)
    : input.memberCode
      ? await findMemberByCode(client, input.memberCode)
      : null;

  if (!member) {
    return {
      ok: false,
      code: "MEMBER_NOT_FOUND",
      message: "Member was not found.",
    };
  }

  const rejection = await validateMember(client, member);
  if (rejection) return rejection;

  const openSession = await findOpenAttendance(client, member.id);
  if (openSession) {
    return {
      ok: false,
      code: "ALREADY_CHECKED_IN",
      message: "This member already has an open check-in.",
    };
  }

  try {
    const attendance = await createAttendance(client, {
      member_id: member.id,
      method: input.method,
      created_by: input.createdBy,
      device_id: input.deviceId,
    });
    return { ok: true, code: "SUCCESS", member, attendance };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("duplicate key")
    ) {
      return {
        ok: false,
        code: "ALREADY_CHECKED_IN",
        message: "This member already has an open check-in.",
      };
    }
    throw error;
  }
}

export async function checkOutMember(
  client: SupabaseClient<Database>,
  memberId: string,
): Promise<AttendanceResult> {
  const member = await findMemberById(client, memberId);
  if (!member) {
    return {
      ok: false,
      code: "MEMBER_NOT_FOUND",
      message: "Member was not found.",
    };
  }

  const openSession = await findOpenAttendance(client, member.id);
  if (!openSession) {
    return {
      ok: false,
      code: "NO_OPEN_CHECK_IN",
      message: "No open check-in was found for this member.",
    };
  }

  const attendance = await closeAttendance(
    client,
    openSession.id,
    new Date().toISOString(),
  );
  return { ok: true, code: "SUCCESS", member, attendance };
}

export function parseMemberQr(payload: string) {
  const match = /^GYM_MEMBER:([A-Z0-9-]+)$/.exec(payload.trim());
  return match?.[1] ?? null;
}
