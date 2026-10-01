import { AdminReports } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminReportsData } from "@/lib/services/admin-service";

export default async function AdminReportsPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminReportsData();
  return (
    <AdminShell activePath="/admin/reports" profileName={profile.full_name}>
      <AdminReports {...data} />
    </AdminShell>
  );
}
