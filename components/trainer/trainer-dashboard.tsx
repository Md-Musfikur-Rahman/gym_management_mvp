import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SignInBrand } from "@/components/auth/sign-in-form";
import { WorkoutForm } from "@/components/trainer/workout-form";
import type {
  MemberRow,
  TrainerRow,
  WorkoutExerciseRow,
  WorkoutPlanRow,
} from "@/lib/supabase/database.types";

type TrainerPlan = WorkoutPlanRow & {
  memberName: string;
  exercises: WorkoutExerciseRow[];
};

export function TrainerDashboard({
  trainer,
  members,
  plans,
}: {
  trainer: TrainerRow | null;
  members: MemberRow[];
  plans: TrainerPlan[];
}) {
  if (!trainer) {
    return (
      <main className="workspace-canvas grid min-h-screen place-items-center px-4">
        <section className="rounded-lg border border-line bg-surface p-8 text-center">
          <SignInBrand />
          <h1 className="mt-7 text-xl font-semibold">
            Trainer profile not linked
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ask an administrator to link this account to a trainer record.
          </p>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-canvas min-h-screen px-4 py-7 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <SignInBrand />
          <SignOutButton />
        </header>
        <div className="mb-7 mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-soft">
            Trainer workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Welcome, {trainer.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your assigned members and workout plans.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-lg border border-line bg-surface p-5">
            <p className="text-xs text-muted">Assigned members</p>
            <p className="mt-3 text-2xl font-semibold">{members.length}</p>
          </article>
          <article className="rounded-lg border border-line bg-surface p-5">
            <p className="text-xs text-muted">Workout plans</p>
            <p className="mt-3 text-2xl font-semibold">{plans.length}</p>
          </article>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
          <section className="rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold">My members</h2>
            </div>
            {members.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold">No members assigned</p>
                <p className="mt-1 text-xs text-muted">
                  An administrator can assign members to your trainer profile.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {members.map((member) => (
                  <li
                    className="flex items-center justify-between gap-3 px-5 py-4"
                    key={member.id}
                  >
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {member.member_code} · {member.phone}
                      </p>
                    </div>
                    <span className="rounded-full bg-forest/8 px-2.5 py-1 text-[10px] font-semibold uppercase text-forest">
                      {member.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold">Assign workout plan</h2>
              <p className="mt-1 text-xs text-muted">
                Plan writes are limited to assigned members.
              </p>
            </div>
            <WorkoutForm members={members} />
          </section>
        </div>
        <section className="mt-5 rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold">Workout plans</h2>
          </div>
          {plans.length === 0 ? (
            <div className="px-6 py-10 text-center text-xs text-muted">
              No workout plans yet.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {plans.map((plan) => (
                <article className="px-5 py-4" key={plan.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted">
                      {plan.memberName} · starts {plan.start_date}
                    </p>
                  </div>
                  {plan.description && (
                    <p className="mt-1 text-xs text-muted">
                      {plan.description}
                    </p>
                  )}
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {plan.exercises.map((exercise) => (
                      <li
                        className="rounded-md bg-background px-3 py-2 text-xs"
                        key={exercise.id}
                      >
                        <p className="font-medium">{exercise.name}</p>
                        <p className="mt-1 text-muted">
                          {exercise.sets} sets × {exercise.reps}
                          {exercise.weight ? ` · ${exercise.weight} kg` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="mt-6 text-xs text-muted">
          <Link className="font-medium text-forest-soft" href="/">
            Northline
          </Link>{" "}
          · Data access is limited by your assigned-member permissions.
        </p>
      </div>
    </main>
  );
}
