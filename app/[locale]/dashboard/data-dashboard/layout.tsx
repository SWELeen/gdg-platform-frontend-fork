import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LeaderLayoutClient } from "../DashboardLayoutClient";
import { leaderDashboardMockData } from "@/data/leader-dashboard";

const committee = leaderDashboardMockData["data-analysis"];

export const metadata: Metadata = {
  title: `Leader Dashboard | ${committee.name} | GDG on Campus UJ`,
  description: `Leader workspace for ${committee.name} management, events, tasks, and points.`,
};

export default function LeaderLayout({ children }: { children: ReactNode }) {
  return <LeaderLayoutClient>{children}</LeaderLayoutClient>;
}
