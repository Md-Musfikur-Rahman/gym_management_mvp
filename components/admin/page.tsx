"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CameraOff,
  Download,
  Plus,
  Server,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  assignAdminMembership,
  createAdminMember,
  createAdminPlan,
  recordAdminPayment,
  type ActionResult,
} from "@/lib/services/admin-actions";
import { AttendanceCheckIn } from "@/components/admin/attendance-check-in";
import {
  recordCheckOut,
  recordDeviceCheckIn,
} from "@/lib/services/attendance-actions";
import type {
  AttendanceRow,
  DeviceRow,
  MemberRow,
  MembershipPlanRow,
  MembershipRow,
  PaymentRow,
  TrainerRow,
} from "@/lib/supabase/database.types";

type DashboardData = {
  totalMembers: number;
  activeMembers: number;
  todayCheckIns: number;
  monthlyRevenue: number;
  recentMembers: MemberRow[];
  recentCheckIns: AttendanceRow[];
};

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-soft">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function Panel({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {detail && <p className="text-xs text-muted">{detail}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="px-5 py-12 text-center sm:px-8">
      <span className="mx-auto grid size-10 place-items-center rounded-md bg-background text-forest-soft">
        <Users size={18} />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
        {detail}
      </p>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const active = status === "ACTIVE" || status === "COMPLETED";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${active ? "bg-forest/8 text-forest" : "bg-background text-muted"}`}
    >
      {status.toLowerCase().replaceAll("_", " ")}
    </span>
  );
}

function DataTable({
  children,
  headers,
}: {
  children: ReactNode;
  headers: string[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-150 border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-line bg-background/70 text-[10px] font-semibold uppercase tracking-widest text-muted">
            {headers.map((header) => (
              <th className="px-5 py-3 font-semibold sm:px-6" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

function ActionForm({
  action,
  children,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    error?: string;
    success?: string;
  }>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({});
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(() => {
      void action(formData).then((result) => {
        if (result.error) {
          setFeedback({ error: result.error });
          return;
        }
        setFeedback({ success: "Saved successfully." });
        form.reset();
        router.refresh();
      });
    });
  }

  return (
    <form className="space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
      {children}
      {feedback.error && (
        <p
          aria-live="polite"
          className="rounded-md border border-coral/20 bg-coral/5 px-3 py-2 text-xs text-coral"
        >
          {feedback.error}
        </p>
      )}
      {feedback.success && (
        <p
          aria-live="polite"
          className="rounded-md border border-forest/15 bg-forest/5 px-3 py-2 text-xs text-forest"
        >
          {feedback.success}
        </p>
      )}
      <Button disabled={isPending} size="sm" type="submit">
        <Plus size={15} />
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function CheckOutButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="text-right">
      <Button
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(() => {
            void recordCheckOut(memberId).then((result) => {
              if (!result.ok) setError(result.message);
              else router.refresh();
            });
          });
        }}
        size="sm"
        type="button"
      >
        <CameraOff size={14} /> {isPending ? "Closing..." : "Check out"}
      </Button>
      {error && <p className="mt-1 max-w-40 text-[10px] text-coral">{error}</p>}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  min,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-medium text-foreground">
      <span>{label}</span>
      <input
        className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
        defaultValue={defaultValue}
        min={min}
        name={name}
        required={required}
        step={step}
        type={type}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-medium text-foreground">
      <span>{label}</span>
      <select
        className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
        defaultValue=""
        name={name}
        required={required}
      >
        <option disabled value="">
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminDashboard({ data }: { data: DashboardData }) {
  const stats = [
    {
      label: "Total members",
      value: data.totalMembers.toLocaleString(),
      note: "All registered members",
      icon: Users,
    },
    {
      label: "Active memberships",
      value: data.activeMembers.toLocaleString(),
      note: "Valid today",
      icon: Activity,
    },
    {
      label: "Check-ins today",
      value: data.todayCheckIns.toLocaleString(),
      note: "Dhaka local date",
      icon: ArrowDownRight,
    },
    {
      label: "Revenue this month",
      value: currency.format(data.monthlyRevenue),
      note: "Completed payments",
      icon: ArrowUpRight,
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="Gym operations"
        title="Overview"
        description="Your live membership and operations summary."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article
            className="rounded-lg border border-line bg-surface p-5"
            key={label}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-muted">{label}</p>
              <Icon aria-hidden="true" className="text-forest-soft" size={17} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">
              {value}
            </p>
            <p className="mt-1 text-[11px] text-muted">{note}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Panel
          title="Recently added members"
          detail={`${data.totalMembers} total`}
        >
          {data.recentMembers.length === 0 ? (
            <EmptyState
              title="No members yet"
              detail="Create your first member profile to begin managing the gym."
            />
          ) : (
            <DataTable headers={["Member", "Code", "Status", "Joined"]}>
              {data.recentMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                    {member.name}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {member.member_code}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <StatusTag status={member.status} />
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {formatDate(member.joined_at)}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel title="Today’s attendance" detail="All methods">
          {data.recentCheckIns.length === 0 ? (
            <EmptyState
              title="No check-ins today"
              detail="Successful check-ins will appear here once attendance is enabled."
            />
          ) : (
            <DataTable headers={["Member ID", "Method", "Time"]}>
              {data.recentCheckIns.map((checkIn) => (
                <tr key={checkIn.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                    {checkIn.member_id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {checkIn.method}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {new Intl.DateTimeFormat("en-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Dhaka",
                    }).format(new Date(checkIn.check_in_at))}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>
    </>
  );
}

export function AdminMembers({
  members,
  trainers,
  memberships,
}: {
  members: MemberRow[];
  trainers: TrainerRow[];
  memberships: MembershipRow[];
}) {
  const currentDate = new Date().toISOString().slice(0, 10);
  const currentMembership = (memberId: string) =>
    memberships.find(
      (membership) =>
        membership.member_id === memberId &&
        membership.start_date <= currentDate &&
        membership.end_date >= currentDate &&
        membership.status === "ACTIVE",
    );
  return (
    <>
      <PageHeading
        eyebrow="Directory"
        title="Members"
        description="Create member profiles and review membership status."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)]">
        <Panel title="Member directory" detail={`${members.length} records`}>
          {members.length === 0 ? (
            <EmptyState
              title="No members yet"
              detail="Add a member using the form. The new record will be saved to Supabase."
            />
          ) : (
            <DataTable
              headers={["Member", "Code", "Phone", "Membership", "Status"]}
            >
              {members.map((member) => {
                const membership = currentMembership(member.id);
                return (
                  <tr key={member.id}>
                    <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                      <span className="block">{member.name}</span>
                      <span className="mt-1 block text-[11px] font-normal text-muted">
                        {member.email ?? "No email"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted sm:px-6">
                      {member.member_code}
                    </td>
                    <td className="px-5 py-3.5 text-muted sm:px-6">
                      {member.phone}
                    </td>
                    <td className="px-5 py-3.5 text-muted sm:px-6">
                      {membership
                        ? `Until ${formatDate(membership.end_date)}`
                        : "None"}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <StatusTag status={member.status} />
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Panel>
        <Panel title="Add member" detail="Creates a profile only">
          <ActionForm action={createAdminMember} submitLabel="Create member">
            <Field label="Full name" name="name" required />
            <Field label="Phone" name="phone" required />
            <Field label="Email (optional)" name="email" type="email" />
            {trainers.length > 0 && (
              <SelectField
                label="Trainer (optional)"
                name="trainerId"
                options={trainers.map((trainer) => ({
                  value: trainer.id,
                  label: trainer.name,
                }))}
              />
            )}
            <p className="text-[11px] leading-5 text-muted">
              This does not create login credentials or assign a paid
              membership.
            </p>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}

export function AdminTrainers({
  trainers,
  members,
}: {
  trainers: TrainerRow[];
  members: MemberRow[];
}) {
  const assignedMemberCounts = new Map<string, number>();
  for (const member of members) {
    if (member.trainer_id) {
      assignedMemberCounts.set(
        member.trainer_id,
        (assignedMemberCounts.get(member.trainer_id) ?? 0) + 1,
      );
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Directory"
        title="Trainers"
        description="Review your trainers, their contact details, and member assignments."
      />
      <Panel title="Trainer directory" detail={`${trainers.length} records`}>
        {trainers.length === 0 ? (
          <EmptyState
            title="No trainers yet"
            detail="Your trainers will appear here once they have been added to the gym."
          />
        ) : (
          <DataTable
            headers={[
              "Trainer",
              "Phone",
              "Specialization",
              "Assigned members",
              "Status",
            ]}
          >
            {trainers.map((trainer) => (
              <tr key={trainer.id}>
                <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                  <span className="block">{trainer.name}</span>
                  <span className="mt-1 block text-[11px] font-normal text-muted">
                    {trainer.email || "No email"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted sm:px-6">
                  {trainer.phone || "Not set"}
                </td>
                <td className="px-5 py-3.5 text-muted sm:px-6">
                  {trainer.specialization || "Not set"}
                </td>
                <td className="px-5 py-3.5 text-muted sm:px-6">
                  {assignedMemberCounts.get(trainer.id) ?? 0}
                </td>
                <td className="px-5 py-3.5 sm:px-6">
                  <StatusTag status={trainer.status} />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}

export function AdminPlans({
  plans,
  memberships,
}: {
  plans: MembershipPlanRow[];
  memberships: MembershipRow[];
}) {
  return (
    <>
      <PageHeading
        eyebrow="Pricing"
        title="Membership plans"
        description="Set the available gym access durations and prices."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section
          aria-label="Available plans"
          className="grid gap-3 sm:grid-cols-2"
        >
          {plans.length === 0 ? (
            <div className="sm:col-span-2">
              <EmptyState
                title="No plans yet"
                detail="Create a plan to make membership assignment available."
              />
            </div>
          ) : (
            plans.map((plan) => (
              <article
                className="rounded-lg border border-line bg-surface p-5"
                key={plan.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {plan.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      {plan.duration_days} days
                    </p>
                  </div>
                  <StatusTag status={plan.status} />
                </div>
                {plan.description && (
                  <p className="mt-4 text-xs leading-5 text-muted">
                    {plan.description}
                  </p>
                )}
                <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                  <p className="text-xl font-semibold text-forest">
                    {currency.format(Number(plan.price))}
                  </p>
                  <p className="text-[11px] text-muted">
                    {
                      memberships.filter((item) => item.plan_id === plan.id)
                        .length
                    }{" "}
                    assignments
                  </p>
                </div>
              </article>
            ))
          )}
        </section>
        <Panel title="Create plan" detail="Price in BDT">
          <ActionForm action={createAdminPlan} submitLabel="Create plan">
            <Field label="Plan name" name="name" required />
            <Field
              label="Duration (days)"
              name="durationDays"
              type="number"
              min="1"
              required
            />
            <Field
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <label className="block space-y-1.5 text-xs font-medium text-foreground">
              <span>Description (optional)</span>
              <textarea
                className="min-h-20 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
                name="description"
              />
            </label>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}

export function AdminMemberships({
  members,
  plans,
  memberships,
}: {
  members: MemberRow[];
  plans: MembershipPlanRow[];
  memberships: MembershipRow[];
}) {
  const plansById = new Map(plans.map((plan) => [plan.id, plan.name]));
  const membersById = new Map(
    members.map((member) => [member.id, member.name]),
  );
  return (
    <>
      <PageHeading
        eyebrow="Subscriptions"
        title="Memberships"
        description="Assign a plan to a member and review current and past terms."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(270px,0.75fr)]">
        <Panel
          title="Membership history"
          detail={`${memberships.length} assignments`}
        >
          {memberships.length === 0 ? (
            <EmptyState
              title="No memberships assigned"
              detail="Choose a member and plan to start a membership term."
            />
          ) : (
            <DataTable
              headers={["Member", "Plan", "Start", "End", "Amount", "Status"]}
            >
              {memberships.map((membership) => (
                <tr key={membership.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                    {membersById.get(membership.member_id) ?? "Unknown member"}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {plansById.get(membership.plan_id) ?? "Unknown plan"}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {formatDate(membership.start_date)}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {formatDate(membership.end_date)}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {currency.format(Number(membership.final_amount))}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <StatusTag status={membership.status} />
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel
          title="Assign membership"
          detail="Dates calculated from plan duration"
        >
          {members.length === 0 || plans.length === 0 ? (
            <EmptyState
              title="Setup needed"
              detail={
                members.length === 0
                  ? "Create a member first."
                  : "Create a membership plan first."
              }
            />
          ) : (
            <ActionForm
              action={assignAdminMembership}
              submitLabel="Assign plan"
            >
              <SelectField
                label="Member"
                name="memberId"
                required
                options={members.map((member) => ({
                  value: member.id,
                  label: `${member.name} · ${member.member_code}`,
                }))}
              />
              <SelectField
                label="Plan"
                name="planId"
                required
                options={plans
                  .filter((plan) => plan.status === "ACTIVE")
                  .map((plan) => ({
                    value: plan.id,
                    label: `${plan.name} · ${currency.format(Number(plan.price))}`,
                  }))}
              />
              <Field
                label="Start date"
                name="startDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
              <Field
                label="Discount"
                name="discount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
              />
            </ActionForm>
          )}
        </Panel>
      </div>
    </>
  );
}

export function AdminPayments({
  members,
  memberships,
  payments,
}: {
  members: MemberRow[];
  memberships: MembershipRow[];
  payments: PaymentRow[];
}) {
  const membersById = new Map(
    members.map((member) => [member.id, member.name]),
  );
  const completedRevenue = payments
    .filter((payment) => payment.status === "COMPLETED")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  return (
    <>
      <PageHeading
        eyebrow="Finance"
        title="Payments"
        description="Record manually received payments and review the ledger."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <article className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs text-muted">Recorded payments</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {payments.length}
          </p>
        </article>
        <article className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs text-muted">Completed total</p>
          <p className="mt-3 text-2xl font-semibold text-forest">
            {currency.format(completedRevenue)}
          </p>
        </article>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(270px,0.75fr)]">
        <Panel title="Payment ledger" detail="No payment gateway processing">
          {payments.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              detail="Record a payment after selecting a member. No payment processor is connected."
            />
          ) : (
            <DataTable
              headers={["Member", "Amount", "Method", "Date", "Status"]}
            >
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                    {membersById.get(payment.member_id) ?? "Unknown member"}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {currency.format(Number(payment.amount))}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {payment.method}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {formatDate(payment.paid_at)}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <StatusTag status={payment.status} />
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel title="Record payment" detail="Manual entry">
          {members.length === 0 ? (
            <EmptyState
              title="Add a member first"
              detail="Payments must be linked to an existing member."
            />
          ) : (
            <ActionForm
              action={recordAdminPayment}
              submitLabel="Record payment"
            >
              <SelectField
                label="Member"
                name="memberId"
                required
                options={members.map((member) => ({
                  value: member.id,
                  label: `${member.name} · ${member.member_code}`,
                }))}
              />
              <Field
                label="Amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
              <SelectField
                label="Payment method"
                name="method"
                required
                options={[
                  "CASH",
                  "BKASH",
                  "NAGAD",
                  "CARD",
                  "BANK",
                  "OTHER",
                ].map((method) => ({ value: method, label: method }))}
              />
              <SelectField
                label="Membership (optional)"
                name="membershipId"
                options={memberships.map((membership) => ({
                  value: membership.id,
                  label: `${membersById.get(membership.member_id) ?? "Member"} · ${formatDate(membership.start_date)}`,
                }))}
              />
              <Field label="Reference (optional)" name="reference" />
              <label className="block space-y-1.5 text-xs font-medium text-foreground">
                <span>Notes (optional)</span>
                <textarea
                  className="min-h-16 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
                  name="notes"
                />
              </label>
            </ActionForm>
          )}
        </Panel>
      </div>
    </>
  );
}

export function AdminAttendance({
  rows,
}: {
  rows: (AttendanceRow & { member: MemberRow | null })[];
}) {
  const openSessions = rows.filter(
    (row) =>
      row.event_type === "CHECK_IN" &&
      !row.check_out_at &&
      row.status === "SUCCESS",
  );

  return (
    <>
      <PageHeading
        eyebrow="Front desk"
        title="Attendance"
        description="Record check-ins through QR or member code. Both use shared membership and duplicate validation."
      />
      <AttendanceCheckIn />
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.68fr)]">
        <Panel title="Attendance history" detail={`${rows.length} records`}>
          {rows.length === 0 ? (
            <EmptyState
              title="No attendance yet"
              detail="Successful manual and QR check-ins will appear here."
            />
          ) : (
            <DataTable
              headers={[
                "Member",
                "Code",
                "Check-in",
                "Check-out",
                "Method",
                "Status",
              ]}
            >
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground sm:px-6">
                    {row.member?.name ?? "Member"}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {row.member?.member_code ?? row.member_id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {formatDate(row.check_in_at)}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {row.check_out_at ? formatDate(row.check_out_at) : "Inside"}
                  </td>
                  <td className="px-5 py-3.5 text-muted sm:px-6">
                    {row.method}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <StatusTag status={row.status} />
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel
          title="Currently inside"
          detail={`${openSessions.length} open sessions`}
        >
          {openSessions.length === 0 ? (
            <EmptyState
              title="Nobody checked in"
              detail="Open check-in sessions will appear here with a check-out action."
            />
          ) : (
            <div className="divide-y divide-line">
              {openSessions.map((row) => (
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  key={row.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {row.member?.name ?? "Member"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {row.member?.member_code ?? ""} · {row.method}
                    </p>
                  </div>
                  <CheckOutButton memberId={row.member_id} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

export function AdminReports({
  members,
  memberships,
  payments,
  attendanceByDay,
  activeMembershipCount,
  completedRevenue,
}: {
  members: MemberRow[];
  memberships: MembershipRow[];
  payments: PaymentRow[];
  attendanceByDay: { day: string; count: number }[];
  activeMembershipCount: number;
  completedRevenue: number;
}) {
  const maximum = Math.max(1, ...attendanceByDay.map((row) => row.count));
  const exports = [
    { label: "Members", resource: "members" },
    { label: "Attendance", resource: "attendance" },
    { label: "Payments", resource: "payments" },
  ];
  return (
    <>
      <PageHeading
        eyebrow="Insights"
        title="Reports"
        description="Current summaries derived from Supabase records."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs text-muted">Members</p>
          <p className="mt-3 text-2xl font-semibold">{members.length}</p>
        </article>
        <article className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs text-muted">Active memberships</p>
          <p className="mt-3 text-2xl font-semibold">{activeMembershipCount}</p>
          <p className="mt-1 text-[11px] text-muted">
            {memberships.length} total assignments
          </p>
        </article>
        <article className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs text-muted">Completed payments</p>
          <p className="mt-3 text-2xl font-semibold">
            BDT {completedRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {payments.length} records
          </p>
        </article>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <Panel
          title="Attendance · last seven days"
          detail="Check-in date in Asia/Dhaka"
        >
          {attendanceByDay.every((row) => row.count === 0) ? (
            <EmptyState
              title="No check-ins in this period"
              detail="Attendance totals update from successful check-in records."
            />
          ) : (
            <div className="space-y-4 p-5">
              {attendanceByDay.map((row) => (
                <div
                  className="grid grid-cols-[90px_1fr_32px] items-center gap-3"
                  key={row.day}
                >
                  <span className="text-[11px] text-muted">
                    {formatDate(row.day)}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-forest-soft"
                      style={{ width: `${(row.count / maximum) * 100}%` }}
                    />
                  </div>
                  <span className="text-right text-xs font-semibold">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="CSV exports" detail="Current rows only">
          <div className="divide-y divide-line">
            {exports.map((item) => (
              <a
                className="flex items-center justify-between gap-3 px-5 py-4 text-xs font-medium text-foreground hover:bg-background"
                href={`/api/admin/exports/${item.resource}`}
                key={item.resource}
              >
                <span>{item.label}</span>
                <Download
                  aria-hidden="true"
                  className="text-forest-soft"
                  size={15}
                />
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function AdminDeviceSimulator({
  members,
  devices,
}: {
  members: MemberRow[];
  devices: DeviceRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function simulate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const data = new FormData(event.currentTarget);
    startTransition(() => {
      void recordDeviceCheckIn(
        String(data.get("memberId") ?? ""),
        String(data.get("deviceId") ?? ""),
        String(data.get("credentialType") ?? "ACCESS_CARD") as
          | "ACCESS_CARD"
          | "PIN",
      )
        .then((result) => {
          setSuccess(result.ok);
          setMessage(
            result.ok
              ? `${result.member.name} checked in through the device simulator.`
              : result.message,
          );
        })
        .catch((error: unknown) => {
          setSuccess(false);
          setMessage(
            error instanceof Error ? error.message : "Device event failed.",
          );
        });
    });
  }

  return (
    <>
      <PageHeading
        eyebrow="Access devices"
        title="Device simulator"
        description="Simulate non-biometric entrance credentials through the shared AttendanceService."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <section className="rounded-lg bg-forest p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-citrus">
                Demo device
              </p>
              <h2 className="mt-2 text-xl font-semibold">SenseFace 7A Plus</h2>
              <p className="mt-1 text-sm text-white/60">Main Entrance</p>
            </div>
            <Server className="text-citrus" size={22} />
          </div>
          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-xs text-white/55">Simulation mode</p>
            <p className="mt-1 text-sm font-medium">
              Offline demonstration · no biometric input
            </p>
          </div>
        </section>
        <section className="rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold">Simulate credential event</h2>
          </div>
          {members.length === 0 || devices.length === 0 ? (
            <EmptyState
              title="Setup needed"
              detail={
                members.length === 0
                  ? "Create a member first."
                  : "No device is configured."
              }
            />
          ) : (
            <form className="space-y-4 p-5" onSubmit={simulate}>
              <SelectField
                label="Member"
                name="memberId"
                required
                options={members.map((member) => ({
                  value: member.id,
                  label: `${member.name} · ${member.member_code}`,
                }))}
              />
              <SelectField
                label="Device"
                name="deviceId"
                required
                options={devices.map((device) => ({
                  value: device.id,
                  label: `${device.name} · ${device.model}`,
                }))}
              />
              <SelectField
                label="Credential"
                name="credentialType"
                required
                options={[
                  { value: "ACCESS_CARD", label: "Access card" },
                  { value: "PIN", label: "PIN" },
                ]}
              />
              {message && (
                <p
                  aria-live="polite"
                  className={`rounded-md px-3 py-2 text-xs ${success ? "bg-forest/5 text-forest" : "bg-coral/5 text-coral"}`}
                >
                  {message}
                </p>
              )}
              <Button disabled={pending} size="sm" type="submit">
                {pending ? "Simulating..." : "Simulate check-in"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
