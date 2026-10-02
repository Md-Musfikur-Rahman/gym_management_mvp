"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Check, Dumbbell, LayoutDashboard, UserRound } from "lucide-react";
import { ProductScreenshot } from "./product-screenshot";
import styles from "@/app/landing.module.css";

const roles = [
  {
    id: "admin",
    label: "For gym owners",
    icon: LayoutDashboard,
    eyebrow: "THE ADMIN WORKSPACE",
    title: "See the whole gym.\nStay a step ahead.",
    description: "From the first check-in to the last payment, bring the moving parts of your gym into one clear view.",
    features: ["Manage members and membership plans", "Track payments and daily attendance", "Keep trainers and reports close at hand"],
    image: "/admin.png",
    alt: "Northline admin dashboard showing members, active memberships, daily check-ins, revenue, and attendance records.",
  },
  {
    id: "trainer",
    label: "For trainers",
    icon: Dumbbell,
    eyebrow: "THE TRAINER WORKSPACE",
    title: "Less back and forth.\nMore forward progress.",
    description: "Give every trainer a dedicated place to see their assigned members and build the next step in their training.",
    features: ["See assigned members in one place", "Create structured workout plans", "Set exercises, sets, reps, and weights"],
    image: "/trainer.png",
    alt: "Northline trainer workspace showing assigned members and the workout plan builder with exercises, sets, reps, and weights.",
  },
  {
    id: "member",
    label: "For members",
    icon: UserRound,
    eyebrow: "THE MEMBER WORKSPACE",
    title: "Their fitness journey.\nTheir own space.",
    description: "Put the everyday essentials in your members’ hands, from their next workout to their membership and check-in code.",
    features: ["Check membership status and payment history", "Follow trainer-assigned workout plans", "View visits and open a personal check-in QR"],
    image: "/member.png",
    alt: "Northline member dashboard with an active membership, QR check-in, workout plans, recent attendance, and payment history.",
  },
];

export function ProductTour() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % roles.length;
    else if (event.key === "ArrowLeft") next = (index + roles.length - 1) % roles.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = roles.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className={styles.productTour}>
      <div className={styles.tourTabs} role="tablist" aria-label="Explore Northline workspaces">
        {roles.map((item, index) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            ref={(node) => { tabs.current[index] = node; }}
            role="tab"
            aria-selected={selected === index}
            aria-controls={`panel-${item.id}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => handleTabKey(event, index)}
            className={`${styles.tourTab} ${selected === index ? styles.activeTab : ""}`}
          >
            <item.icon size={18} aria-hidden="true" />
            {item.label}
            <ArrowUpRight size={17} className={styles.tabArrow} aria-hidden="true" />
          </button>
        ))}
      </div>

      {roles.map((role, index) => <div
        key={role.id}
        id={`panel-${role.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${role.id}`}
        hidden={selected !== index}
        tabIndex={0}
        className={styles.tourPanel}
      >
        <div className={styles.tourCopy}>
          <p className={styles.eyebrow}>{role.eyebrow}</p>
          <h3>{role.title}</h3>
          <p className={styles.bodyCopy}>{role.description}</p>
          <ul className={styles.checkList}>
            {role.features.map((feature) => (
              <li key={feature}><Check size={16} aria-hidden="true" />{feature}</li>
            ))}
          </ul>
          <a href={role.image} target="_blank" rel="noreferrer" className={styles.textLink}>
            Open full-size preview <ArrowUpRight size={17} aria-hidden="true" />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </div>
        <div className={styles.tourVisual}>
          <div className={styles.previewBar} aria-hidden="true">
            <span className={styles.windowDots}><i /><i /><i /></span>
            <span>northline / {role.id}</span>
            <span className={styles.previewLive}>PRODUCT PREVIEW</span>
          </div>
          <ProductScreenshot src={role.image} alt={role.alt} sizes="(max-width: 900px) 90vw, 800px" />
        </div>
      </div>)}
    </div>
  );
}
