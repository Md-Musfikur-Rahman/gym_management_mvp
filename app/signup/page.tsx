import { redirect } from "next/navigation";
import Link from "next/link";
import { SignInBrand, SignUpForm } from "@/components/auth/sign-in-form";
import { getCurrentProfile } from "@/lib/services/auth-service";

export default async function SignUpPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect("/");
  }

  return (
    <main className="workspace-canvas grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-105 rounded-lg border border-line bg-surface p-6 shadow-sm sm:p-8">
        <SignInBrand />
        <div className="mt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-forest-soft">
            Member access
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Register as a member to get started. Gym membership plans and access
            are managed separately by your gym.
          </p>
        </div>
        <SignUpForm />
        <p className="mt-5 border-t border-line pt-5 text-center text-xs text-muted">
          <Link
            className="font-semibold text-forest-soft hover:text-forest"
            href="/login"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
