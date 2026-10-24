import type { ReactNode } from "react";
import { LeaderLayoutClient } from "../DashboardLayoutClient";

export default function ClubLeadershipLayout({ children }: { children: ReactNode }) {
  return (
    <LeaderLayoutClient committee="project-management" clubLeadership>
      {children}
    </LeaderLayoutClient>
  );
}
