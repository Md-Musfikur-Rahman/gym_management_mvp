import { AdminPayments } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminPaymentsData } from "@/lib/services/admin-service";

export default async function AdminPaymentsPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminPaymentsData();
  return (
    <AdminShell activePath="/admin/payments" profileName={profile.full_name}>
      <AdminPayments {...data} />
    </AdminShell>
  );
}
