"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import type { CommitteeMember } from "./types";
import { ConfirmModal } from "./ConfirmModal";
import { leaderCommitteeConfig } from "./committee-config";
import { ALL, CommitteeBadges, CommitteeFilterSelect, RoleFilterSelect, matchesCommittee, matchesRole, pointsFor } from "./ClubFilters";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Trophy,
  Clock,
} from "lucide-react";

interface MembersSectionProps {
  onOpenAddMember: () => void;
  onOpenTemporaryAccess?: (member: CommitteeMember) => void;
  onOpenUpdatePoints: (member: CommitteeMember) => void;
}

export function MembersSection({
  onOpenAddMember,
  onOpenTemporaryAccess,
  onOpenUpdatePoints,
}: MembersSectionProps) {
  const t = useTranslations("dashboard.leader");
  const { members, removeMember, canManageMembers, canAddMembers, canManagePoints, currentMember, committeeName, committee, clubLeadership } = useLeaderDashboard();
  const showTemporaryAccess = !clubLeadership && leaderCommitteeConfig[committee].canGrantTemporaryAccess;
  const [searchTerm, setSearchTerm] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState(ALL);
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [memberToRemove, setMemberToRemove] = useState<CommitteeMember | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const filtersActive = Boolean(searchTerm) || committeeFilter !== ALL || roleFilter !== ALL;
  const columnCount = 5 + (showTemporaryAccess ? 1 : 0) + (clubLeadership ? 1 : 0);
  let emptyMessage = t("members.empty");
  if (clubLeadership && filtersActive) emptyMessage = t("groupFilters.noMembers");
  else if (searchTerm) emptyMessage = t("members.noSearch");
  const filteredMembers = members.filter(
    (m) =>
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
      matchesCommittee(m, committeeFilter) &&
      matchesRole(m, roleFilter, committeeFilter)
  );

  return (
    <div className="space-y-6">
      {/* Banner explaining Temporary Access */}
      {showTemporaryAccess && <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-800/50 dark:bg-[#0f1f38] dark:text-blue-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-blue-950 dark:text-blue-100">
              {t("members.temporaryTitle")}
            </h3>
            <p className="leading-relaxed text-blue-800/80 dark:text-blue-300/80">
              {canManageMembers
                ? t("members.temporaryLeaders")
                : t("members.temporaryMembers")}
            </p>
          </div>
        </div>
      </div>}

      {/* Table Card */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs">
        {/* Table Top Controls */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-border/80">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t("members.title", { count: members.length })}
            </h2>
            <p className="text-xs text-muted">
              {showTemporaryAccess
                ? t("members.manageTemporary")
                : t("members.manageMembers", { committee: committeeName })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("members.search")}
                className="h-9 rounded-xl border border-border bg-surface-muted/40 ps-8 pe-3 text-xs text-foreground outline-none focus:border-blue-500"
              />
            </div>

            {clubLeadership && (
              <>
                <CommitteeFilterSelect value={committeeFilter} onChange={setCommitteeFilter} />
                <RoleFilterSelect value={roleFilter} onChange={setRoleFilter} />
              </>
            )}

            {canAddMembers && (
              <button
                type="button"
                onClick={onOpenAddMember}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus className="size-3.5" />
                <span>{clubLeadership ? t("groupFilters.addToCommittee") : t("members.add")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5 text-start">{t("members.member")}</th>
                <th className="px-4 py-3.5 text-start">{t("members.role")}</th>
                {clubLeadership && <th className="px-4 py-3.5 text-start">{t("groupFilters.committees")}</th>}
                <th className="px-4 py-3.5 text-start">{t("members.status")}</th>
                {showTemporaryAccess && <th className="px-4 py-3.5 text-start">{t("members.accessLevel")}</th>}
                <th className="px-4 py-3.5 text-start">{t("members.points")}</th>
                <th className="px-5 py-3.5 text-end">{t("members.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="px-5 py-10 text-center text-sm text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              ) : filteredMembers.map((member) => {
                const isElevatedActive =
                  member.isElevated &&
                  member.accessExpiresAt &&
                  member.accessExpiresAt > currentTime;

                const remainingMins = isElevatedActive && member.accessExpiresAt
                  ? Math.max(1, Math.round((member.accessExpiresAt - currentTime) / (1000 * 60)))
                  : 0;

                return (
                  <tr key={member.id} className="transition hover:bg-surface-muted/20">
                    {/* MEMBER */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${member.avatarBgColor}`}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <span className="block font-bold text-foreground">
                            {member.name}
                          </span>
                          <span className="block text-[11px] text-muted">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-4 py-3.5 font-medium text-foreground/90 whitespace-nowrap">
                      {member.role}
                    </td>

                    {/* COMMITTEES */}
                    {clubLeadership && (
                      <td className="px-4 py-3.5">
                        <CommitteeBadges member={member} />
                      </td>
                    )}

                    {/* STATUS */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {member.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <span className="size-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <span className="size-1.5 rounded-full bg-amber-600" />
                          Away
                        </span>
                      )}
                    </td>

                    {/* ACCESS LEVEL */}
                    {showTemporaryAccess && <td className="px-4 py-3.5 whitespace-nowrap">
                      {isElevatedActive ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <ShieldCheck className="size-3 text-blue-600 dark:text-blue-300" />
                            Elevated ({remainingMins}m left)
                          </span>
                          <span className="text-[10px] text-muted">
                            {t("members.expiresAt", { time: new Date(member.accessExpiresAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">{t("members.standard")}</span>
                      )}
                    </td>}

                    {/* POINTS */}
                    <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {t("members.pointsUnit", { count: pointsFor(member, committeeFilter).toLocaleString() })}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-3.5 text-end whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Grant / Manage Temporary Access Button */}
                        {showTemporaryAccess && canManageMembers && onOpenTemporaryAccess && (
                          <button
                            type="button"
                            onClick={() => onOpenTemporaryAccess(member)}
                            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
                              isElevatedActive
                                ? "border-blue-500/40 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                : "border-border text-foreground hover:bg-surface-muted"
                            }`}
                          >
                            <Clock className="size-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{isElevatedActive ? "Manage Access" : "Grant Access"}</span>
                          </button>
                        )}

                        {/* Update Points */}
                        {canManagePoints && member.id !== currentMember?.id && (
                          <button
                            type="button"
                            title={t("members.updatePoints")}
                            onClick={() => onOpenUpdatePoints(member)}
                            className="rounded-lg p-1.5 text-muted hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                          >
                            <Trophy className="size-4" />
                          </button>
                        )}

                        {/* Remove Member */}
                        {canManageMembers && (
                          <button
                            type="button"
                            title={t("members.remove")}
                            onClick={() => setMemberToRemove(member)}
                            className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => {
          if (memberToRemove) {
            removeMember(memberToRemove.id);
          }
        }}
        title={t("members.remove")}
        message={
          <>
            Are you sure you want to remove{" "}
            <strong className="text-foreground">{memberToRemove?.name}</strong> from the
            committee? They will lose access to committee tasks and permissions.
          </>
        }
        confirmText={t("members.remove")}
        cancelText={t("members.cancel")}
        danger
      />
    </div>
  );
}
