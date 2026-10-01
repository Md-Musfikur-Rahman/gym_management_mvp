import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SignInBrand } from "@/components/auth/sign-in-form";
import { findMemberByProfileId } from "@/lib/repositories/members";
import { requireRole } from "@/lib/services/auth-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MemberQrPage() {
  const profile = await requireRole("MEMBER");
  const supabase = await createSupabaseServerClient();
  const member = await findMemberByProfileId(supabase, profile.id);

  if (!member) {
    return (
      <main className="workspace-canvas grid min-h-screen place-items-center px-4 py-10">
        <section className="w-full max-w-md rounded-lg border border-line bg-surface p-7 text-center">
          <SignInBrand />
          <h1 className="mt-8 text-xl font-semibold text-foreground">
            Member profile not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ask gym reception to link your account to a member profile.
          </p>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-canvas grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-sm rounded-lg border border-line bg-surface p-6 text-center shadow-sm sm:p-8">
        <header className="flex items-center justify-between gap-3 text-left">
          <SignInBrand />
          <SignOutButton />
        </header>
        <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-soft">
          Member check-in
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          {member.name}
        </h1>
        <p className="mt-1 text-xs text-muted">{member.member_code}</p>
        <div className="mx-auto mt-7 grid w-fit place-items-center rounded-lg border border-line bg-white p-4">
          <QRCodeSVG
            value={`GYM_MEMBER:${member.member_code}`}
            size={220}
            level="M"
            marginSize={1}
          />
        </div>
        <p className="mt-5 text-xs leading-5 text-muted">
          Show this code at reception to check in. It contains only your member
          code.
        </p>
        <Link
          className="mt-5 inline-block text-xs font-semibold text-forest-soft hover:text-forest"
          href="/member"
        >
          Back to member home
        </Link>
      </section>
    </main>
  );
}
