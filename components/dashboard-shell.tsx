"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Menu,
  QrCode,
  Settings2,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  {
    label: "Workspace",
    items: [{ label: "Overview", icon: LayoutDashboard, href: "/" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Members", icon: Users },
      { label: "Memberships", icon: CreditCard },
      { label: "Attendance", icon: CalendarCheck },
      { label: "Check-in", icon: QrCode },
    ],
  },
  {
    label: "Coaching",
    items: [
      { label: "Trainers", icon: Activity },
      { label: "Workouts", icon: Dumbbell },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", icon: BarChart3 },
      { label: "Devices", icon: Building2 },
      { label: "Settings", icon: Settings2 },
    ],
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-forest text-white">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex h-19.5 items-center gap-3 border-b border-white/10 px-6"
      >
        <span className="grid size-9 place-items-center rounded-md bg-citrus text-forest">
          <Activity aria-hidden="true" size={19} strokeWidth={2.6} />
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold leading-5 tracking-wide">
            NORTHLINE
          </span>
          <span className="block text-[10px] font-medium uppercase leading-4 tracking-[0.16em] text-white/55">
            Club operations
          </span>
        </span>
      </Link>

      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-6"
      >
        {navigationGroups.map((group) => (
          <div className="mb-7" key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/42">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ label, icon: Icon, href }) =>
                href ? (
                  <Link
                    aria-current="page"
                    className="flex h-10 items-center gap-3 rounded-md bg-white/10 px-3 text-[13px] font-medium text-white"
                    href={href}
                    key={label}
                    onClick={onNavigate}
                  >
                    <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    {label}
                  </Link>
                ) : (
                  <button
                    aria-disabled="true"
                    className="flex h-10 w-full cursor-not-allowed items-center gap-3 rounded-md px-3 text-left text-[13px] font-medium text-white/48"
                    disabled
                    key={label}
                    title="Planned for a later checkpoint"
                    type="button"
                  >
                    <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-md bg-white/6 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/10 text-citrus">
            <Building2 aria-hidden="true" size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">Your gym</span>
            <span className="block truncate text-[11px] text-white/48">
              Workspace setup
            </span>
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="text-white/42"
            size={15}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({
  hasSupabaseEnvironment,
}: {
  hasSupabaseEnvironment: boolean;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-63 md:block">
        <Sidebar />
      </aside>

      {mobileNavOpen && (
        <>
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-forest/45 md:hidden"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(292px,84vw)] shadow-2xl md:hidden">
            <div className="absolute right-3 top-5 z-10">
              <Button
                aria-label="Close navigation"
                className="text-white hover:bg-white/10"
                onClick={() => setMobileNavOpen(false)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" size={18} />
              </Button>
            </div>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </>
      )}

      <div className="min-w-0 flex-1 md:ml-63">
        <header className="sticky top-0 z-20 flex h-17.5 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <Button
              aria-label="Open navigation"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Menu aria-hidden="true" size={20} />
            </Button>
            <div className="text-[13px] text-muted">
              <span className="hidden sm:inline">Workspace</span>
              <span
                aria-hidden="true"
                className="mx-2 hidden text-line sm:inline"
              >
                /
              </span>
              <span className="font-medium text-foreground">Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-muted sm:flex">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  hasSupabaseEnvironment ? "bg-forest-soft" : "bg-coral",
                )}
              />
              {hasSupabaseEnvironment ? "Environment ready" : "Setup needed"}
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-[#f0d8c9] text-xs font-semibold text-[#693d2c]">
              N
            </span>
          </div>
        </header>

        <main className="workspace-canvas min-h-[calc(100vh-70px)] px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
          <div className="enter-view mx-auto w-full max-w-275">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-soft">
                  Your club at a glance
                </p>
                <h1 className="text-[29px] font-semibold leading-tight text-foreground sm:text-[34px]">
                  Overview
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  A calm starting point for the daily work of running your gym.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="grid size-8 place-items-center rounded-md bg-white ring-1 ring-line">
                  <Activity
                    aria-hidden="true"
                    className="text-forest-soft"
                    size={15}
                  />
                </span>
                Foundation workspace
              </div>
            </div>

            <section className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
              <div className="relative flex min-h-72.5 flex-col justify-between overflow-hidden rounded-lg bg-forest p-6 text-white sm:p-8">
                <div className="absolute -right-14 -top-20 size-64 rounded-full border border-white/10" />
                <div className="absolute -right-2 -top-8 size-40 rounded-full border border-white/10" />
                <div className="relative z-10">
                  <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[11px] font-medium text-white/75">
                    <span className="size-1.5 rounded-full bg-citrus" />
                    Workspace initialized
                  </span>
                  <h2 className="max-w-md text-[25px] font-medium leading-[1.2] sm:text-[30px]">
                    Make room for the work that moves people forward.
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                    The foundation is in place. Your operational data will
                    appear here after database and access setup.
                  </p>
                </div>
                <div className="relative z-10 mt-8 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.13em] text-citrus">
                  <span className="h-px w-8 bg-citrus/70" />
                  Northline workspace
                </div>
              </div>

              <section
                aria-labelledby="environment-title"
                className="flex min-h-72.5 flex-col rounded-lg border border-line bg-surface p-6 sm:p-7"
                id="setup"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
                      Connection
                    </p>
                    <h2
                      className="mt-2 text-lg font-semibold"
                      id="environment-title"
                    >
                      Supabase environment
                    </h2>
                  </div>
                  <span
                    className={cn(
                      "mt-1 size-2.5 rounded-full ring-4",
                      hasSupabaseEnvironment
                        ? "bg-forest-soft ring-forest-soft/10"
                        : "bg-coral ring-coral/10",
                    )}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {hasSupabaseEnvironment
                    ? "Project URL and public key are present in the environment."
                    : "Add your project URL and publishable key to prepare the Supabase clients."}
                </p>
                <div className="mt-6 space-y-3 border-t border-line pt-5">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted">Project URL</span>
                    <span className="font-medium text-foreground">
                      {hasSupabaseEnvironment ? "Configured" : "Not configured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted">Public key</span>
                    <span className="font-medium text-foreground">
                      {hasSupabaseEnvironment ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </div>
                <a
                  className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-xs font-semibold text-forest-soft transition-colors hover:text-forest"
                  href="https://supabase.com/dashboard"
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Supabase dashboard{" "}
                  <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              </section>
            </section>

            <section className="mt-8 border-t border-line pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Operational data
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    No business records are shown until the database and role
                    access are ready.
                  </p>
                </div>
                <span className="rounded-md border border-line bg-white/70 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Awaiting setup
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
