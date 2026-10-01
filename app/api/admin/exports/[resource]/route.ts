import { listAttendance } from "@/lib/repositories/attendance";
import { listMembers } from "@/lib/repositories/members";
import { listPayments } from "@/lib/repositories/payments";
import { requireRole } from "@/lib/services/auth-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function escapeCsv(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function csvResponse(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  await requireRole("ADMIN");
  const { resource } = await params;
  const supabase = await createSupabaseServerClient();

  if (resource === "members") {
    const members = await listMembers(supabase);
    return csvResponse(
      "members.csv",
      ["Member code", "Name", "Phone", "Email", "Status", "Joined"],
      members.map((row) => [
        row.member_code,
        row.name,
        row.phone,
        row.email,
        row.status,
        row.joined_at,
      ]),
    );
  }
  if (resource === "attendance") {
    const attendance = await listAttendance(supabase);
    return csvResponse(
      "attendance.csv",
      ["Member ID", "Method", "Event", "Check in", "Check out", "Status"],
      attendance.map((row) => [
        row.member_id,
        row.method,
        row.event_type,
        row.check_in_at,
        row.check_out_at,
        row.status,
      ]),
    );
  }
  if (resource === "payments") {
    const payments = await listPayments(supabase);
    return csvResponse(
      "payments.csv",
      [
        "Member ID",
        "Membership ID",
        "Amount",
        "Method",
        "Reference",
        "Paid at",
        "Status",
      ],
      payments.map((row) => [
        row.member_id,
        row.membership_id,
        row.amount,
        row.method,
        row.reference,
        row.paid_at,
        row.status,
      ]),
    );
  }

  return new Response("Not found", { status: 404 });
}
