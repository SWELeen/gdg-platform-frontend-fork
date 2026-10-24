import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LeaderLayoutClient } from "../DashboardLayoutClient";
import { leaderDashboardMockData } from "@/data/leader-dashboard";

const committee = leaderDashboardMockData.pr;

export const metadata: Metadata = {
  title: `${committee.name} Leader Dashboard | GDG on Campus UJ`,
  description: committee.description,
};

export default function PRDashboardLayout({ children }: { children: ReactNode }) {
  return <LeaderLayoutClient committee="pr">{children}</LeaderLayoutClient>;
}
