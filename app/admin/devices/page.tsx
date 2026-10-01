import { AdminDeviceSimulator } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDeviceData } from "@/lib/services/attendance-actions";
import { requireRole } from "@/lib/services/auth-service";

export default async function AdminDevicesPage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminDeviceData();
  return (
    <AdminShell activePath="/admin/devices" profileName={profile.full_name}>
      <AdminDeviceSimulator {...data} />
    </AdminShell>
  );
}
