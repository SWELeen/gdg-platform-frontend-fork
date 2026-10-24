"use client";

import { useState } from "react";
import { MembersSection } from "../MembersSection";
import { AddMemberModal } from "../AddMemberModal";
import { PointsModal } from "../PointsModal";
import type { CommitteeMember } from "../types";

export function ClubMembersPage() {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [pointsMember, setPointsMember] = useState<CommitteeMember | null>(null);
  return (
    <div className="space-y-6">
      <MembersSection onOpenAddMember={() => setAddMemberOpen(true)} onOpenUpdatePoints={setPointsMember} />
      <AddMemberModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} />
      <PointsModal isOpen={Boolean(pointsMember)} onClose={() => setPointsMember(null)} member={pointsMember} />
    </div>
  );
}
