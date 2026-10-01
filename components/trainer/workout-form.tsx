"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTrainerWorkout } from "@/lib/services/trainer-actions";
import type { MemberRow } from "@/lib/supabase/database.types";

export function WorkoutForm({ members }: { members: MemberRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(() => {
      void createTrainerWorkout(formData).then((result) => {
        if (result.error) {
          setIsError(true);
          setFeedback(result.error);
          return;
        }
        setIsError(false);
        setFeedback("Workout plan assigned.");
        form.reset();
        router.refresh();
      });
    });
  }

  return (
    <form className="space-y-4 p-5 sm:p-6" onSubmit={submit}>
      <label className="block space-y-1.5 text-xs font-medium text-foreground">
        <span>Member</span>
        <select
          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
          name="memberId"
          required
        >
          <option value="">Choose assigned member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} · {member.member_code}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-foreground">
        <span>Plan name</span>
        <input
          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
          name="name"
          placeholder="Strength foundation"
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5 text-xs font-medium text-foreground">
          <span>Start date</span>
          <input
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
            defaultValue={new Date().toISOString().slice(0, 10)}
            name="startDate"
            required
            type="date"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-medium text-foreground">
          <span>Description (optional)</span>
          <input
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
            name="description"
          />
        </label>
      </div>
      <div className="border-t border-line pt-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Exercises</p>
        {[0, 1, 2].map((index) => (
          <div
            className="mb-3 grid grid-cols-[minmax(0,1fr)_56px_64px_72px] gap-2"
            key={index}
          >
            <input
              aria-label={`Exercise ${index + 1} name`}
              className="h-9 min-w-0 rounded-md border border-line px-2 text-xs"
              name="exerciseName"
              placeholder={index === 0 ? "Bench press" : "Exercise (optional)"}
              required={index === 0}
            />
            <input
              aria-label={`Exercise ${index + 1} sets`}
              className="h-9 min-w-0 rounded-md border border-line px-2 text-xs"
              min="1"
              name="sets"
              placeholder="Sets"
              required={index === 0}
              type="number"
            />
            <input
              aria-label={`Exercise ${index + 1} reps`}
              className="h-9 min-w-0 rounded-md border border-line px-2 text-xs"
              name="reps"
              placeholder="Reps"
              required={index === 0}
            />
            <input
              aria-label={`Exercise ${index + 1} weight`}
              className="h-9 min-w-0 rounded-md border border-line px-2 text-xs"
              min="0"
              name="weight"
              placeholder="kg"
              step="0.5"
              type="number"
            />
          </div>
        ))}
      </div>
      {feedback && (
        <p
          aria-live="polite"
          className={`rounded-md px-3 py-2 text-xs ${isError ? "bg-coral/5 text-coral" : "bg-forest/5 text-forest"}`}
        >
          {feedback}
        </p>
      )}
      <Button
        disabled={pending || members.length === 0}
        size="sm"
        type="submit"
      >
        <Plus size={15} />
        {pending ? "Assigning..." : "Assign workout plan"}
      </Button>
    </form>
  );
}
