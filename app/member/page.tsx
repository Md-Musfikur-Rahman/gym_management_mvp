import { MemberDashboard } from "@/components/member/member-dashboard";
import { requireRole } from "@/lib/services/auth-service";
import { getMemberWorkspace } from "@/lib/services/role-workspace-service";

export default async function MemberPage() {
  const profile = await requireRole("MEMBER");
  const data = await getMemberWorkspace(profile);
  return <MemberDashboard {...data} />;
}
