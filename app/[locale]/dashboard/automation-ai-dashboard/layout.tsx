import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LeaderLayoutClient } from "../DashboardLayoutClient";
import { leaderDashboardMockData } from "@/data/leader-dashboard";
import type { LeaderCommittee } from "@/components/dashboard/shared/types";

const committee = "automation-ai" as LeaderCommittee;
const config = leaderDashboardMockData[committee];
export const metadata: Metadata = { title: `${config.name} Leader Dashboard | GDG on Campus UJ`, description: config.description };
export default function CommitteeDashboardLayout({ children }: { children: ReactNode }) {
  return <LeaderLayoutClient committee={committee}>{children}</LeaderLayoutClient>;
}


