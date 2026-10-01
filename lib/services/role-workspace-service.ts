import { listAttendance } from "@/lib/repositories/attendance";
import { listMembers } from "@/lib/repositories/members";
import { listMemberships } from "@/lib/repositories/memberships";
import { listPayments } from "@/lib/repositories/payments";
import { findTrainerByProfileId } from "@/lib/repositories/trainers";
import {
  listWorkoutExercises,
  listWorkoutPlans,
} from "@/lib/repositories/workouts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/database.types";

export async function getTrainerWorkspace(profile: ProfileRow) {
  const supabase = await createSupabaseServerClient();
  const trainer = await findTrainerByProfileId(supabase, profile.id);
  if (!trainer) return { trainer: null, members: [], plans: [] };

  const [members, plans] = await Promise.all([
    listMembers(supabase),
    listWorkoutPlans(supabase, { trainerId: trainer.id }),
  ]);
  const exercises = await Promise.all(
    plans.map((plan) => listWorkoutExercises(supabase, plan.id)),
  );
  return {
    trainer,
    members,
    plans: plans.map((plan, index) => ({
      ...plan,
      memberName:
        members.find((member) => member.id === plan.member_id)?.name ??
        "Member",
      exercises: exercises[index],
    })),
  };
}

export async function getMemberWorkspace(profile: ProfileRow) {
  const supabase = await createSupabaseServerClient();
  const members = await listMembers(supabase);
  const member = members.find((row) => row.profile_id === profile.id) ?? null;
  if (!member) {
    return {
      member: null,
      memberships: [],
      attendance: [],
      plans: [],
      payments: [],
    };
  }

  const [memberships, attendance, plans, payments] = await Promise.all([
    listMemberships(supabase, member.id),
    listAttendance(supabase, member.id),
    listWorkoutPlans(supabase, { memberId: member.id }),
    listPayments(supabase, member.id),
  ]);
  const exercises = await Promise.all(
    plans.map((plan) => listWorkoutExercises(supabase, plan.id)),
  );
  return {
    member,
    memberships,
    attendance,
    payments,
    plans: plans.map((plan, index) => ({
      ...plan,
      exercises: exercises[index],
    })),
  };
}
