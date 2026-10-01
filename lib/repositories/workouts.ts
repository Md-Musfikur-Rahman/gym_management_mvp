import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  WorkoutExerciseRow,
  WorkoutPlanRow,
} from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export type NewWorkoutPlan = Pick<
  WorkoutPlanRow,
  "member_id" | "trainer_id" | "name" | "start_date"
> &
  Partial<Pick<WorkoutPlanRow, "description" | "end_date" | "status">>;

export type NewWorkoutExercise = Pick<
  WorkoutExerciseRow,
  "workout_plan_id" | "name" | "sets" | "reps" | "order_index"
> &
  Partial<Pick<WorkoutExerciseRow, "weight" | "notes">>;

export async function createWorkoutPlan(
  client: SupabaseClient<Database>,
  plan: NewWorkoutPlan,
): Promise<WorkoutPlanRow> {
  const { data, error } = await client
    .from("workout_plans")
    .insert(plan)
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Workout plan insert returned no record.");
  return data;
}

export async function createWorkoutExercises(
  client: SupabaseClient<Database>,
  exercises: NewWorkoutExercise[],
): Promise<WorkoutExerciseRow[]> {
  const { data, error } = await client
    .from("workout_exercises")
    .insert(exercises)
    .select("*");

  throwOnSupabaseError(error);
  return data ?? [];
}

export async function listWorkoutPlans(
  client: SupabaseClient<Database>,
  filters: { memberId?: string; trainerId?: string } = {},
): Promise<WorkoutPlanRow[]> {
  let query = client
    .from("workout_plans")
    .select("*")
    .order("start_date", { ascending: false });

  if (filters.memberId) {
    query = query.eq("member_id", filters.memberId);
  }
  if (filters.trainerId) {
    query = query.eq("trainer_id", filters.trainerId);
  }

  const { data, error } = await query;
  throwOnSupabaseError(error);
  return data ?? [];
}

export async function listWorkoutExercises(
  client: SupabaseClient<Database>,
  workoutPlanId: string,
): Promise<WorkoutExerciseRow[]> {
  const { data, error } = await client
    .from("workout_exercises")
    .select("*")
    .eq("workout_plan_id", workoutPlanId)
    .order("order_index", { ascending: true });

  throwOnSupabaseError(error);
  return data ?? [];
}
