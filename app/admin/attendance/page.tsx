import { AdminAttendance } from "@/components/admin/page";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAttendanceData } from "@/lib/services/attendance-actions";
import { requireRole } from "@/lib/services/auth-service";

export default async function AdminAttendancePage() {
  const profile = await requireRole("ADMIN");
  const data = await getAdminAttendanceData();
  return (
    <AdminShell activePath="/admin/attendance" profileName={profile.full_name}>
      <AdminAttendance rows={data.rows} />
    </AdminShell>
  );
}
