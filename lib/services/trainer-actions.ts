"use server";

import { revalidatePath } from "next/cache";
import { findTrainerByProfileId } from "@/lib/repositories/trainers";
import {
  createWorkoutExercises,
  createWorkoutPlan,
} from "@/lib/repositories/workouts";
import { requireRole } from "@/lib/services/auth-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TrainerActionResult = { error?: string };

export async function createTrainerWorkout(
  formData: FormData,
): Promise<TrainerActionResult> {
  try {
    const profile = await requireRole("TRAINER");
    const supabase = await createSupabaseServerClient();
    const trainer = await findTrainerByProfileId(supabase, profile.id);
    if (!trainer) throw new Error("Your trainer profile is not linked yet.");

    const memberId = String(formData.get("memberId") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    if (!memberId || !name || !startDate) {
      throw new Error("Member, plan name, and start date are required.");
    }

    const plan = await createWorkoutPlan(supabase, {
      member_id: memberId,
      trainer_id: trainer.id,
      name,
      start_date: startDate,
      description: String(formData.get("description") ?? "").trim() || null,
    });

    const names = formData.getAll("exerciseName").map(String);
    const sets = formData.getAll("sets").map(String);
    const reps = formData.getAll("reps").map(String);
    const weights = formData.getAll("weight").map(String);
    const exercises = names
      .map((exerciseName, index) => ({
        name: exerciseName.trim(),
        sets: Number(sets[index]),
        reps: reps[index]?.trim() ?? "",
        weight: weights[index] ? Number(weights[index]) : null,
        order_index: index,
      }))
      .filter(
        (exercise) => exercise.name && exercise.sets > 0 && exercise.reps,
      );

    if (exercises.length > 0) {
      await createWorkoutExercises(
        supabase,
        exercises.map((exercise) => ({
          ...exercise,
          workout_plan_id: plan.id,
        })),
      );
    }

    revalidatePath("/trainer");
    revalidatePath("/member");
    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not create workout.",
    };
  }
}
