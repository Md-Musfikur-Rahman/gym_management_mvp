"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          "Sign-in failed. Check your email and password, then try again.",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to connect to the sign-in service. Check your setup and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-foreground"
          htmlFor="email"
        >
          Email address
        </label>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-foreground"
          htmlFor="password"
        >
          Password
        </label>
        <input
          autoComplete="current-password"
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {errorMessage && (
        <p
          aria-live="polite"
          className="rounded-md border border-coral/20 bg-coral/5 px-3 py-2 text-xs leading-5 text-coral"
        >
          {errorMessage}
        </p>
      )}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
        {!isSubmitting && <ArrowRight aria-hidden="true" size={16} />}
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    if (password.length < 12) {
      setErrorMessage("Choose a password with at least 12 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setErrorMessage(
        "No session was created. This email may already be registered; try signing in instead.",
      );
    } catch {
      setErrorMessage(
        "Unable to connect to the sign-up service. Check your setup and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-foreground"
          htmlFor="fullName"
        >
          Full name
        </label>
        <input
          autoComplete="name"
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
          id="fullName"
          maxLength={120}
          name="fullName"
          required
          type="text"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-foreground"
          htmlFor="email"
        >
          Email address
        </label>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-foreground"
          htmlFor="password"
        >
          Password
        </label>
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
          id="password"
          minLength={12}
          name="password"
          required
          type="password"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-foreground"
          htmlFor="passwordConfirmation"
        >
          Confirm password
        </label>
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
          id="passwordConfirmation"
          minLength={12}
          name="passwordConfirmation"
          required
          type="password"
        />
      </div>
      {errorMessage && (
        <p
          aria-live="polite"
          className="rounded-md border border-coral/20 bg-coral/5 px-3 py-2 text-xs leading-5 text-coral"
        >
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          aria-live="polite"
          className="rounded-md border border-forest/15 bg-forest/5 px-3 py-2 text-xs leading-5 text-forest"
        >
          {successMessage}
        </p>
      )}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create member account"}
        {!isSubmitting && <ArrowRight aria-hidden="true" size={16} />}
      </Button>
      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <a
          className="font-semibold text-forest-soft hover:text-forest"
          href="/login"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}

export function SignInBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-md bg-citrus text-forest">
        <Activity aria-hidden="true" size={20} strokeWidth={2.5} />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-wide">
          NORTHLINE
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          Club operations
        </span>
      </span>
    </div>
  );
}
