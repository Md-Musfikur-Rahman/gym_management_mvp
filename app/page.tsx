import { redirect } from "next/navigation";
import { getCurrentProfile, roleHome } from "@/lib/services/auth-service";

export default async function Home() {
  const profile = await getCurrentProfile();
  redirect(profile ? roleHome[profile.role] : "/login");
}
