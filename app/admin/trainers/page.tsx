import { AdminTrainers } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminTrainersData } from "@/lib/services/admin-service";

export default async function AdminTrainersPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminTrainersData();
  return (
    <AdminShell activePath="/admin/trainers" profileName={profile.full_name}>
      <AdminTrainers {...data} />
    </AdminShell>
  );
}
