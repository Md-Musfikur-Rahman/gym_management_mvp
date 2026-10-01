"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const adminNavigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Membership plans", href: "/admin/plans", icon: CreditCard },
  { label: "Memberships", href: "/admin/memberships", icon: Activity },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  {
    label: "Attendance",
    href: "/admin/attendance",
    icon: CalendarCheck,
  },
  { label: "Devices", href: "/admin/devices", icon: Building2 },
  { label: "Trainers", href: "/admin/trainers", icon: Users },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

function AdminSidebar({
  activePath,
  profileName,
  onNavigate,
}: {
  activePath: string;
  profileName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-forest text-white">
      <Link
        className="flex h-19.5 items-center gap-3 border-b border-white/10 px-5"
        href="/admin"
        onClick={onNavigate}
      >
        <span className="grid size-9 place-items-center rounded-md bg-citrus text-forest">
          <Activity aria-hidden="true" size={19} strokeWidth={2.5} />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-wide">
            NORTHLINE
          </span>
          <span className="block text-[10px] uppercase tracking-[0.14em] text-white/55">
            Admin workspace
          </span>
        </span>
      </Link>
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-6">
        {adminNavigation.map(({ label, href, icon: Icon }) => (
          <Link
            aria-current={activePath === href ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors",
              activePath === href
                ? "bg-white/12 text-white"
                : "text-white/68 hover:bg-white/7 hover:text-white",
            )}
            href={href}
            key={label}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f0d8c9] text-xs font-semibold text-[#693d2c]">
            {profileName.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium">
            {profileName}
          </span>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminShell({
  activePath,
  profileName,
  children,
}: {
  activePath: string;
  profileName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage =
    adminNavigation.find((item) => item.href === activePath)?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-63 md:block">
        <AdminSidebar activePath={activePath} profileName={profileName} />
      </aside>
      {mobileOpen && (
        <>
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-forest/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(292px,84vw)] md:hidden">
            <button
              aria-label="Close navigation"
              className="absolute right-3 top-5 z-10 grid size-9 place-items-center rounded-md text-white hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <AdminSidebar
              activePath={activePath}
              onNavigate={() => setMobileOpen(false)}
              profileName={profileName}
            />
          </aside>
        </>
      )}
      <div className="min-w-0 flex-1 md:ml-63">
        <header className="sticky top-0 z-20 flex h-17.5 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              className="grid size-9 place-items-center rounded-md text-foreground hover:bg-background md:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Menu size={19} />
            </button>
            <span className="text-xs text-muted">
              Admin <span className="mx-2 text-line">/</span>
              <span className="font-medium text-foreground">{currentPage}</span>
            </span>
          </div>
          <span className="text-xs text-muted">Gym operations</span>
        </header>
        <main className="workspace-canvas min-h-[calc(100vh-70px)] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
          <div className="enter-view mx-auto w-full max-w-275">{children}</div>
        </main>
      </div>
    </div>
  );
}
