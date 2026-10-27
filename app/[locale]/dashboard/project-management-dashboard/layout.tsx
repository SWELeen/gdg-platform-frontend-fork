import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LeaderLayoutClient } from "../DashboardLayoutClient";
import { leaderDashboardMockData } from "@/data/leader-dashboard";
import type { LeaderCommittee } from "@/components/dashboard/shared/types";

const committee: LeaderCommittee = "project-management";
const config = leaderDashboardMockData[committee];

export const metadata: Metadata = {
  title: `${config.name} Leader Dashboard | GDG on Campus UJ`,
  description: config.description,
};

export default function ProjectManagementDashboardLayout({ children }: { children: ReactNode }) {
  return <LeaderLayoutClient committee={committee}>{children}</LeaderLayoutClient>;
}
