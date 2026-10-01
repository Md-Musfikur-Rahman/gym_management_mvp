import { TrainerDashboard } from "@/components/trainer/trainer-dashboard";
import { requireRole } from "@/lib/services/auth-service";
import { getTrainerWorkspace } from "@/lib/services/role-workspace-service";

export default async function TrainerPage() {
  const profile = await requireRole("TRAINER");
  const data = await getTrainerWorkspace(profile);
  return <TrainerDashboard {...data} />;
}
