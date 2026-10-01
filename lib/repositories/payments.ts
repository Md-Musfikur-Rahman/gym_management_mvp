import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PaymentRow } from "@/lib/supabase/database.types";
import { throwOnSupabaseError } from "@/lib/repositories/errors";

export type NewPayment = Pick<PaymentRow, "member_id" | "amount" | "method"> &
  Partial<
    Pick<
      PaymentRow,
      "membership_id" | "reference" | "paid_at" | "notes" | "created_by"
    >
  >;

export async function createPayment(
  client: SupabaseClient<Database>,
  payment: NewPayment,
): Promise<PaymentRow> {
  const { data, error } = await client
    .from("payments")
    .insert(payment)
    .select("*")
    .single();

  throwOnSupabaseError(error);
  if (!data) throw new Error("Payment insert returned no record.");
  return data;
}

export async function listPayments(
  client: SupabaseClient<Database>,
  memberId?: string,
): Promise<PaymentRow[]> {
  let query = client
    .from("payments")
    .select("*")
    .order("paid_at", { ascending: false });

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query;
  throwOnSupabaseError(error);
  return data ?? [];
}
