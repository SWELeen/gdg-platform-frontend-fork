"use client";

import { useState } from "react";
import { MembersSection } from "../MembersSection";
import { AddToCommitteeModal } from "../AddToCommitteeModal";
import { PointsModal } from "../PointsModal";
import type { CommitteeMember } from "../types";
import { RemoveClubMemberModal } from "../RemoveClubMemberModal";
import { useLeaderDashboard } from "../LeaderDashboardContext";
import { leaderCommitteeConfig, committeeTranslationKeys } from "../committee-config";
import { useTranslations } from "next-intl";
import type { LeaderCommittee } from "../types";

export function ClubMembersPage() {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [removeMemberEmail, setRemoveMemberEmail] = useState<string | null>(null);
  const [pointsMember, setPointsMember] = useState<CommitteeMember | null>(null);
  const { removeClubMemberByEmail, members } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader.nav");
  const filtersT = useTranslations("dashboard.leader.groupFilters");
  const committees = (Object.keys(leaderCommitteeConfig) as LeaderCommittee[]).map((key) => ({
    code: leaderCommitteeConfig[key].committeeCode,
    name: t(committeeTranslationKeys[key]),
  }));
  return (
    <div className="space-y-6">
      <MembersSection
        onOpenAddMember={() => setAddMemberOpen(true)}
        onOpenRemoveMember={(email) => setRemoveMemberEmail(email ?? "")}
        onOpenUpdatePoints={setPointsMember}
      />
      <AddToCommitteeModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} />
      <RemoveClubMemberModal
        isOpen={removeMemberEmail !== null}
        initialEmail={removeMemberEmail ?? ""}
        committees={committees}
        members={members}
        onClose={() => setRemoveMemberEmail(null)}
        onConfirm={removeClubMemberByEmail}
      />
      <PointsModal isOpen={Boolean(pointsMember)} onClose={() => setPointsMember(null)} member={pointsMember} />
    </div>
  );
}
