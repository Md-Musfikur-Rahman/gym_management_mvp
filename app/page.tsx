import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/marketing/landing-page";
import { getCurrentProfile, roleHome } from "@/lib/services/auth-service";

export const metadata: Metadata = {
  metadataBase: new URL("https://gym-management-musfikur.vercel.app"),
  title: "Northline | Gym Management, Simplified",
  description:
    "Less admin. More room to grow. Bring memberships, attendance, payment records, and workout plans together with Northline gym management.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Northline",
    title: "Northline | Gym Management, Simplified",
    description:
      "One connected workspace for your gym, your trainers, and your members. Explore Northline's live gym management platform.",
    url: "/",
    images: [
      {
        url: "/admin.png",
        width: 2940,
        height: 1912,
        alt: "Northline gym management dashboard showing memberships, attendance, and payment records",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Northline | Gym Management, Simplified",
    description:
      "Less admin. More room to grow. A connected workspace for your gym, trainers, and members.",
    images: ["/admin.png"],
  },
};

export default async function Home() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(roleHome[profile.role]);
  }

  return <LandingPage />;
}
