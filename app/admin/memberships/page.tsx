import { AdminMemberships } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminMembershipsData } from "@/lib/services/admin-service";

export default async function AdminMembershipsPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminMembershipsData();
  return (
    <AdminShell activePath="/admin/memberships" profileName={profile.full_name}>
      <AdminMemberships {...data} />
    </AdminShell>
  );
}
