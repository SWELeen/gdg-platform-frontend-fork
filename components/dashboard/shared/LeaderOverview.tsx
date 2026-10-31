"use client";

import { useState } from "react";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { LeaderGreeting } from "./LeaderGreeting";
import { MetricCards } from "./MetricCards";
import { EventReportsPanel } from "../data-analysis/EventReportsPanel";
import { TasksPreview } from "./TasksPreview";
import { MemberPointsPreview } from "../data-analysis/MemberPointsPreview";
import { RecentActivityPreview } from "../data-analysis/RecentActivityPreview";
import { PointsModal } from "./PointsModal";
import type { CommitteeMember } from "./types";

export function LeaderOverview() {
  const [member, setMember] = useState<CommitteeMember | null>(null);
  const [pointsOpen, setPointsOpen] = useState(false);
  const { committee, canManageRegistrations } = useLeaderDashboard();

  return (
    <div className="space-y-6">
      <LeaderGreeting />
      <MetricCards />
      {committee === "data-analysis" && canManageRegistrations && <EventReportsPanel />}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
        <MemberPointsPreview onUpdatePoints={(target) => { setMember(target); setPointsOpen(true); }} />
        <RecentActivityPreview />
      </div>
      <TasksPreview />
      <PointsModal isOpen={pointsOpen} onClose={() => setPointsOpen(false)} member={member} />
    </div>
  );
}
