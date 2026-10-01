import { AdminPlans } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminPlansData } from "@/lib/services/admin-service";

export default async function AdminPlansPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminPlansData();
  return (
    <AdminShell activePath="/admin/plans" profileName={profile.full_name}>
      <AdminPlans {...data} />
    </AdminShell>
  );
}
