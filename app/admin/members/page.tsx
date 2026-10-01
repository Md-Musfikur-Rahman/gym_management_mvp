import { AdminMembers } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/services/auth-service";
import { getAdminMembersData } from "@/lib/services/admin-service";

export default async function AdminMembersPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminMembersData();
  return (
    <AdminShell activePath="/admin/members" profileName={profile.full_name}>
      <AdminMembers {...data} />
    </AdminShell>
  );
}
