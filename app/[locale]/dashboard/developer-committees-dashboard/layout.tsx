import type { ReactNode } from "react";
import { LeaderLayoutClient } from "../DashboardLayoutClient";

export default function DeveloperCommitteesLeaderLayout({ children }: { children: ReactNode }) {
  return (
    <LeaderLayoutClient committee="automation" developerCommitteesLeader>
      {children}
    </LeaderLayoutClient>
  );
}
