import { listAttendance } from "@/lib/repositories/attendance";
import { listMembers } from "@/lib/repositories/members";
import { listMembershipPlans } from "@/lib/repositories/membership-plans";
import { listMemberships } from "@/lib/repositories/memberships";
import { listPayments } from "@/lib/repositories/payments";
import { listTrainers } from "@/lib/repositories/trainers";
import { listDevices } from "@/lib/repositories/devices";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = await createSupabaseServerClient();
  const [members, memberships, attendance, payments] = await Promise.all([
    listMembers(supabase),
    listMemberships(supabase),
    listAttendance(supabase),
    listPayments(supabase),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
  }).format(new Date());
  const activeMemberships = memberships.filter(
    (membership) =>
      membership.status === "ACTIVE" &&
      membership.start_date <= today &&
      membership.end_date >= today,
  );
  const activeMemberIds = new Set(
    activeMemberships.map(({ member_id }) => member_id),
  );
  const todayCheckIns = attendance.filter(
    ({ check_in_at, status }) =>
      status === "SUCCESS" &&
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(
        new Date(check_in_at),
      ) === today,
  );
  const monthPrefix = today.slice(0, 7);
  const monthlyRevenue = payments
    .filter(
      ({ paid_at, status }) =>
        status === "COMPLETED" &&
        new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" })
          .format(new Date(paid_at))
          .startsWith(monthPrefix),
    )
    .reduce((total, payment) => total + Number(payment.amount), 0);

  return {
    totalMembers: members.length,
    activeMembers: members.filter(
      (member) => member.status === "ACTIVE" && activeMemberIds.has(member.id),
    ).length,
    todayCheckIns: todayCheckIns.length,
    monthlyRevenue,
    recentMembers: [...members]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 6),
    recentCheckIns: todayCheckIns.slice(0, 6),
  };
}

export async function getAdminMembersData() {
  const supabase = await createSupabaseServerClient();
  const [members, trainers, memberships] = await Promise.all([
    listMembers(supabase),
    listTrainers(supabase),
    listMemberships(supabase),
  ]);
  return { members, trainers, memberships };
}

export async function getAdminTrainersData() {
  const supabase = await createSupabaseServerClient();
  const [trainers, members] = await Promise.all([
    listTrainers(supabase),
    listMembers(supabase),
  ]);
  return { trainers, members };
}

export async function getAdminPlansData() {
  const supabase = await createSupabaseServerClient();
  const [plans, memberships] = await Promise.all([
    listMembershipPlans(supabase),
    listMemberships(supabase),
  ]);
  return { plans, memberships };
}

export async function getAdminMembershipsData() {
  const supabase = await createSupabaseServerClient();
  const [members, plans, memberships] = await Promise.all([
    listMembers(supabase),
    listMembershipPlans(supabase),
    listMemberships(supabase),
  ]);
  return { members, plans, memberships };
}

export async function getAdminPaymentsData() {
  const supabase = await createSupabaseServerClient();
  const [members, memberships, payments] = await Promise.all([
    listMembers(supabase),
    listMemberships(supabase),
    listPayments(supabase),
  ]);
  return { members, memberships, payments };
}

export async function getAdminDevicesData() {
  const supabase = await createSupabaseServerClient();
  const [members, devices] = await Promise.all([
    listMembers(supabase),
    listDevices(supabase),
  ]);
  return { members, devices };
}

export async function getAdminReportsData() {
  const supabase = await createSupabaseServerClient();
  const [members, memberships, attendance, payments] = await Promise.all([
    listMembers(supabase),
    listMemberships(supabase),
    listAttendance(supabase),
    listPayments(supabase),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
  }).format(new Date());
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayDate);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  const attendanceByDay = days.map((day) => ({
    day,
    count: attendance.filter(
      (row) =>
        row.status === "SUCCESS" &&
        new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(
          new Date(row.check_in_at),
        ) === day,
    ).length,
  }));
  const activeMembershipCount = memberships.filter(
    (row) =>
      row.status === "ACTIVE" &&
      row.start_date <= today &&
      row.end_date >= today,
  ).length;
  const completedRevenue = payments
    .filter((row) => row.status === "COMPLETED")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  return {
    members,
    memberships,
    attendance,
    payments,
    attendanceByDay,
    activeMembershipCount,
    completedRevenue,
  };
}
