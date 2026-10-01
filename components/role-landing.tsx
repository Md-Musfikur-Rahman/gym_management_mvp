import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SignInBrand } from "@/components/auth/sign-in-form";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";

const roleLabels: Record<AppRole, string> = {
  ADMIN: "Administrator",
  TRAINER: "Trainer",
  MEMBER: "Member",
};

export function RoleLanding({ profile }: { profile: ProfileRow }) {
  return (
    <main className="workspace-canvas min-h-screen px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-6">
          <SignInBrand />
          <SignOutButton />
        </header>
        <section className="mt-12 max-w-2xl enter-view">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-forest-soft">
            {roleLabels[profile.role]} workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground">
            Welcome, {profile.full_name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your account is authenticated and your role has been verified.
            Workspace data and actions will be added in the next product
            checkpoints.
          </p>
          <div className="mt-8 flex items-start gap-3 border-t border-line pt-6">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-forest text-citrus">
              <ArrowRight aria-hidden="true" size={14} />
            </span>
            <p className="text-xs leading-5 text-muted">
              Access to database records is enforced by your role and Supabase
              Row Level Security.
            </p>
          </div>
          {profile.role === "MEMBER" && (
            <Link
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-forest px-4 text-sm font-medium text-white hover:bg-forest-soft"
              href="/member/qr"
            >
              Show my check-in QR <ArrowRight aria-hidden="true" size={15} />
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
