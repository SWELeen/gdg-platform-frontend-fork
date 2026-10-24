"use client";

import { useState } from "react";
import { MembersSection } from "../MembersSection";
import { AddMemberModal } from "../AddMemberModal";
import { TemporaryAccessModal } from "../TemporaryAccessModal";
import { PointsModal } from "../PointsModal";
import { useLeaderDashboard } from "../LeaderDashboardContext";
import { leaderCommitteeConfig } from "../committee-config";
import type { CommitteeMember } from "../types";
import { MembershipRequestsPanel } from "../MembershipRequestsPanel";

export function CommitteeMembersPage() {
  const { committee } = useLeaderDashboard();
  const canGrantTemporaryAccess = leaderCommitteeConfig[committee].canGrantTemporaryAccess;
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [accessMember, setAccessMember] = useState<CommitteeMember | null>(null);
  const [pointsMember, setPointsMember] = useState<CommitteeMember | null>(null);

  return (
    <div className="space-y-6">
      <MembershipRequestsPanel />
      <MembersSection
        onOpenAddMember={() => setAddMemberOpen(true)}
        onOpenTemporaryAccess={canGrantTemporaryAccess ? setAccessMember : undefined}
        onOpenUpdatePoints={setPointsMember}
      />
      <AddMemberModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} />
      {canGrantTemporaryAccess && (
        <TemporaryAccessModal
          isOpen={Boolean(accessMember)}
          onClose={() => setAccessMember(null)}
          member={accessMember}
        />
      )}
      <PointsModal
        isOpen={Boolean(pointsMember)}
        onClose={() => setPointsMember(null)}
        member={pointsMember}
      />
    </div>
  );
}
