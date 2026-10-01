import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  QrCode,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SignInBrand } from "@/components/auth/sign-in-form";
import type {
  AttendanceRow,
  MemberRow,
  MembershipRow,
  PaymentRow,
  WorkoutExerciseRow,
  WorkoutPlanRow,
} from "@/lib/supabase/database.types";

type MemberPlan = WorkoutPlanRow & { exercises: WorkoutExerciseRow[] };

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <span className="text-forest-soft">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function MemberDashboard({
  member,
  memberships,
  attendance,
  plans,
  payments,
}: {
  member: MemberRow | null;
  memberships: MembershipRow[];
  attendance: AttendanceRow[];
  plans: MemberPlan[];
  payments: PaymentRow[];
}) {
  if (!member) {
    return (
      <main className="workspace-canvas grid min-h-screen place-items-center px-4">
        <section className="rounded-lg border border-line bg-surface p-8 text-center">
          <SignInBrand />
          <h1 className="mt-7 text-xl font-semibold">
            Member profile not linked
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ask gym reception to link this account to your member profile.
          </p>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </section>
      </main>
    );
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
  }).format(new Date());
  const membership = memberships.find(
    (item) =>
      item.status === "ACTIVE" &&
      item.start_date <= today &&
      item.end_date >= today,
  );
  const month = today.slice(0, 7);
  const monthlyVisits = attendance.filter(
    (item) =>
      item.status === "SUCCESS" && item.check_in_at.slice(0, 7) === month,
  ).length;

  return (
    <main className="workspace-canvas min-h-screen px-4 py-7 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <SignInBrand />
          <SignOutButton />
        </header>
        <div className="mb-7 mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-soft">
            Member workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Welcome, {member.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your gym membership, visits, and training.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg bg-forest p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-citrus">
                  Membership
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {membership ? "Active" : "No active membership"}
                </h2>
                <p className="mt-2 text-xs text-white/65">
                  {membership
                    ? `Valid through ${membership.end_date}`
                    : "Contact reception to choose a plan."}
                </p>
              </div>
              <CreditCard className="text-citrus" size={20} />
            </div>
          </section>
          <Link
            className="flex min-h-32 items-center justify-between gap-3 rounded-lg border border-line bg-surface p-6 transition hover:border-forest/30"
            href="/member/qr"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-forest-soft">
                Reception
              </p>
              <h2 className="mt-2 text-base font-semibold">Show my QR</h2>
              <p className="mt-1 text-xs text-muted">{member.member_code}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-md bg-citrus text-forest">
              <QrCode size={19} />
            </span>
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <article className="rounded-lg border border-line bg-surface p-5">
            <p className="text-xs text-muted">Visits this month</p>
            <p className="mt-2 text-2xl font-semibold">{monthlyVisits}</p>
          </article>
          <article className="rounded-lg border border-line bg-surface p-5">
            <p className="text-xs text-muted">Workout plans</p>
            <p className="mt-2 text-2xl font-semibold">{plans.length}</p>
          </article>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel title="Workout plans" icon={<Dumbbell size={16} />}>
            {plans.length === 0 ? (
              <p className="px-5 py-8 text-xs text-muted">
                No workouts have been assigned yet.
              </p>
            ) : (
              <div className="divide-y divide-line">
                {plans.map((plan) => (
                  <article className="px-5 py-4" key={plan.id}>
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      From {plan.start_date}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {plan.exercises.map((exercise) => (
                        <li className="text-xs" key={exercise.id}>
                          {exercise.name}
                          <span className="ml-2 text-muted">
                            {exercise.sets} × {exercise.reps}
                            {exercise.weight ? ` · ${exercise.weight} kg` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Recent attendance" icon={<CalendarCheck size={16} />}>
            {attendance.length === 0 ? (
              <p className="px-5 py-8 text-xs text-muted">
                Your check-ins will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {attendance.slice(0, 6).map((item) => (
                  <li
                    className="flex justify-between gap-3 px-5 py-3 text-xs"
                    key={item.id}
                  >
                    <span>
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeZone: "Asia/Dhaka",
                      }).format(new Date(item.check_in_at))}
                    </span>
                    <span className="text-muted">
                      {item.method} ·{" "}
                      {item.check_out_at ? "Complete" : "Checked in"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <div className="mt-5">
          <Panel title="Payment history" icon={<CreditCard size={16} />}>
            {payments.length === 0 ? (
              <p className="px-5 py-8 text-xs text-muted">
                No payment records yet.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {payments.slice(0, 8).map((payment) => (
                  <li
                    className="flex justify-between gap-3 px-5 py-3 text-xs"
                    key={payment.id}
                  >
                    <span>
                      {payment.method} ·{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeZone: "Asia/Dhaka",
                      }).format(new Date(payment.paid_at))}
                    </span>
                    <span className="font-medium">
                      BDT {Number(payment.amount).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-forest-soft"
          href="/member/qr"
        >
          Open check-in QR <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
