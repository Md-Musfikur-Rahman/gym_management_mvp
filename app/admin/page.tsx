import { AdminDashboard } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminDashboardData } from "@/lib/services/admin-service";

export default async function AdminPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminDashboardData();
  return (
    <AdminShell activePath="/admin" profileName={profile.full_name}>
      <AdminDashboard data={data} />
    </AdminShell>
  );
}
