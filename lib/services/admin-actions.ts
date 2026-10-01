"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/services/auth-service";
import { createMember } from "@/lib/repositories/members";
import { createMembershipPlan } from "@/lib/repositories/membership-plans";
import { createMembership } from "@/lib/repositories/memberships";
import { createPayment } from "@/lib/repositories/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

function requiredText(formData: FormData, field: string, label: string) {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function positiveNumber(formData: FormData, field: string, label: string) {
  const value = Number(formData.get(field));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
  return value;
}

export async function createAdminMember(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");
    const supabase = await createSupabaseServerClient();
    const name = requiredText(formData, "name", "Name");
    const phone = requiredText(formData, "phone", "Phone");
    const email = String(formData.get("email") ?? "").trim() || null;
    const trainerId = String(formData.get("trainerId") ?? "").trim() || null;
    const memberCode = `GYM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    await createMember(supabase, {
      member_code: memberCode,
      name,
      phone,
      email,
      trainer_id: trainerId,
      joined_at: new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
    });
    revalidatePath("/admin");
    revalidatePath("/admin/members");
    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not create member.",
    };
  }
}

export async function createAdminPlan(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");
    const supabase = await createSupabaseServerClient();
    const durationDays = positiveNumber(formData, "durationDays", "Duration");
    const price = Number(formData.get("price"));
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Price must be zero or greater.");
    }

    await createMembershipPlan(supabase, {
      name: requiredText(formData, "name", "Plan name"),
      description: String(formData.get("description") ?? "").trim() || null,
      duration_days: Math.floor(durationDays),
      price,
      status: "ACTIVE",
    });
    revalidatePath("/admin/plans");
    revalidatePath("/admin/memberships");
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create plan.",
    };
  }
}

export async function assignAdminMembership(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");
    const supabase = await createSupabaseServerClient();
    const memberId = requiredText(formData, "memberId", "Member");
    const planId = requiredText(formData, "planId", "Plan");
    const startDate = requiredText(formData, "startDate", "Start date");
    const discount = Number(formData.get("discount") ?? 0);
    const { data: plan, error } = await supabase
      .from("membership_plans")
      .select("duration_days, price")
      .eq("id", planId)
      .single();
    if (error) throw new Error(error.message);
    if (!plan) throw new Error("Selected plan was not found.");

    const start = new Date(`${startDate}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()))
      throw new Error("Start date is invalid.");
    if (!Number.isFinite(discount) || discount < 0 || discount > plan.price) {
      throw new Error("Discount must be between zero and the plan price.");
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + plan.duration_days - 1);

    await createMembership(supabase, {
      member_id: memberId,
      plan_id: planId,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      price: Number(plan.price),
      discount,
      final_amount: Number(plan.price) - discount,
      status: "ACTIVE",
    });
    revalidatePath("/admin");
    revalidatePath("/admin/memberships");
    revalidatePath("/admin/payments");
    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not assign membership.",
    };
  }
}

export async function recordAdminPayment(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireRole("ADMIN");
    const supabase = await createSupabaseServerClient();
    const memberId = requiredText(formData, "memberId", "Member");
    const amount = positiveNumber(formData, "amount", "Amount");
    const method = requiredText(formData, "method", "Payment method");
    const validMethods = ["CASH", "BKASH", "NAGAD", "CARD", "BANK", "OTHER"];
    if (!validMethods.includes(method))
      throw new Error("Choose a valid payment method.");
    const membershipId =
      String(formData.get("membershipId") ?? "").trim() || null;

    await createPayment(supabase, {
      member_id: memberId,
      membership_id: membershipId,
      amount,
      method: method as "CASH" | "BKASH" | "NAGAD" | "CARD" | "BANK" | "OTHER",
      reference: String(formData.get("reference") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: profile.id,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/payments");
    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not record payment.",
    };
  }
}
