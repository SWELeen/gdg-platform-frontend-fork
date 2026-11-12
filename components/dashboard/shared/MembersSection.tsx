"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import type { CommitteeMember } from "./types";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MEMBERS_PER_PAGE = 10;

type MemberGroup = "clubLeadership" | "developerLeadership" | "committeeLeaders" | "committeeCoLeaders" | "advisors" | "members" | "other";

function getMemberGroup(member: CommitteeMember): MemberGroup {
  const globalRoles = member.globalRoles ?? [];
  const roleText = member.role.toUpperCase();
  const roleParts = member.role.split(" / ");
  if (globalRoles.includes("GROUP_LEADER") || globalRoles.includes("GROUP_CO_LEADER") || roleText.includes("GROUP_LEADER") || roleText.includes("GROUP_CO_LEADER")) {
    return "clubLeadership";
  }
  if (globalRoles.includes("DEVELOPER_COMMITTEES_LEADER") || roleText.includes("DEVELOPER_COMMITTEES_LEADER")) {
    return "developerLeadership";
  }
  if (globalRoles.includes("ADVISOR") || roleText.includes("ADVISOR")) return "advisors";

  const committeeRoles = (member.committees ?? []).map((item) => item.role);
  if (committeeRoles.includes("Leader") || roleParts.includes("Leader")) return "committeeLeaders";
  if (committeeRoles.includes("Co-Leader") || roleParts.includes("Co-Leader")) return "committeeCoLeaders";
  if (committeeRoles.length > 0 || roleText === "MEMBER") return "members";
  return "other";
}

const MEMBER_GROUP_ORDER: Record<MemberGroup, number> = {
  clubLeadership: 0,
  developerLeadership: 1,
  committeeLeaders: 2,
  committeeCoLeaders: 3,
  advisors: 4,
  members: 5,
  other: 6,
};

interface MembersSectionProps {
  onOpenAddMember: () => void;
  onOpenRemoveMember?: (email?: string) => void;
  onOpenTemporaryAccess?: (member: CommitteeMember) => void;
  onOpenUpdatePoints: (member: CommitteeMember) => void;
}

export function MembersSection({
  onOpenAddMember,
  onOpenRemoveMember,
  onOpenTemporaryAccess,
  onOpenUpdatePoints,
}: MembersSectionProps) {
  const t = useTranslations("dashboard.leader");
  const { members, canManageMembers, canAddMembers, canManagePoints, currentMember, committeeName, committee, clubLeadership, developerCommitteesLeader } = useLeaderDashboard();
  const showTemporaryAccess = !clubLeadership && leaderCommitteeConfig[committee].canGrantTemporaryAccess;
  const [searchTerm, setSearchTerm] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState(ALL);
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [page, setPage] = useState(1);

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
  const sortedMembers = [...filteredMembers].sort((left, right) => {
    const groupDifference = MEMBER_GROUP_ORDER[getMemberGroup(left)] - MEMBER_GROUP_ORDER[getMemberGroup(right)];
    return groupDifference || left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
  const pageCount = Math.max(1, Math.ceil(sortedMembers.length / MEMBERS_PER_PAGE));
  const pageMembers = sortedMembers.slice((page - 1) * MEMBERS_PER_PAGE, page * MEMBERS_PER_PAGE);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  const groupLabel = (group: MemberGroup) => {
    switch (group) {
      case "clubLeadership": return t("members.groups.clubLeadership");
      case "developerLeadership": return t("members.groups.developerLeadership");
      case "committeeLeaders": return t("members.groups.committeeLeaders");
      case "committeeCoLeaders": return t("members.groups.committeeCoLeaders");
      case "advisors": return t("members.groups.advisors");
      case "members": return t("members.groups.members");
      case "other": return t("members.groups.other");
    }
  };

  const pageRows: Array<{ type: "group"; group: MemberGroup } | { type: "member"; member: CommitteeMember }> = [];
  let previousGroup: MemberGroup | null = null;
  for (const member of pageMembers) {
    const group = getMemberGroup(member);
    if (group !== previousGroup) pageRows.push({ type: "group", group });
    pageRows.push({ type: "member", member });
    previousGroup = group;
  }

  return (
    <div className="space-y-6">
      {/* Banner explaining Temporary Access */}
      {showTemporaryAccess && <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-800/50 dark:bg-[var(--members-temp-access-dark-bg)] dark:text-blue-200">
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
              {t("members.title", { count: filteredMembers.length })}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder={t("members.search")}
                className="h-9 rounded-xl border border-border bg-surface-muted/40 ps-8 pe-3 text-xs text-foreground outline-none focus:border-blue-500"
              />
            </div>

            {clubLeadership && (
              <>
                <CommitteeFilterSelect value={committeeFilter} onChange={(value) => { setCommitteeFilter(value); setPage(1); }} />
                <RoleFilterSelect value={roleFilter} onChange={(value) => { setRoleFilter(value); setPage(1); }} />
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
            {clubLeadership && canManageMembers && onOpenRemoveMember && (
              <button
                type="button"
                onClick={() => onOpenRemoveMember()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="size-3.5" />
                <span>{t("groupFilters.removeMemberByEmail")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-start text-sm md:min-w-full md:text-xs">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
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
              ) : pageRows.map((row) => {
                if (row.type === "group") {
                  const groupCount = filteredMembers.filter((member) => getMemberGroup(member) === row.group).length;
                  return (
                    <tr key={`group-${row.group}`} className="bg-surface-muted/40">
                      <td colSpan={columnCount} className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-muted">
                        {groupLabel(row.group)} <span className="ms-1 font-medium normal-case">({groupCount})</span>
                      </td>
                    </tr>
                  );
                }
                const { member } = row;
                const globalDeveloperLeader = member.globalRoles?.includes("DEVELOPER_COMMITTEES_LEADER") ?? false;
                const leadershipCommittees = (member.committees ?? []).filter((item) => item.role === "Leader" || item.role === "Co-Leader");
                const visibleLeadershipCommittees = committeeFilter === ALL
                  ? leadershipCommittees
                  : leadershipCommittees.filter((item) => item.code === committeeFilter);
                const committeePointTarget = clubLeadership
                  ? visibleLeadershipCommittees[0]
                  : (member.committees ?? []).find((item) => item.code === leaderCommitteeConfig[committee].committeeCode) ?? member.committees?.[0];
                const canManageThisMemberPoints = clubLeadership
                  ? globalDeveloperLeader || visibleLeadershipCommittees.length > 0
                  : developerCommitteesLeader
                    ? leadershipCommittees.length > 0
                    : member.role === "Member";
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
                          {member.wallet && (
                            <span className="mt-1 block text-[11px] text-muted">
                              {t("members.walletNumber", { number: member.wallet.membershipNumber })}
                              {" · "}
                              {t(member.wallet.linked ? "members.walletLinked" : "members.walletUnlinked")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-4 py-3.5 font-medium text-foreground/90 whitespace-nowrap">
                      {member.role.split(" / ").map((role) => role === "DEVELOPER_COMMITTEES_LEADER" ? t("groupFilters.roleDeveloperLeader") : role).join(" / ")}
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
                      {member.pointsVisible === false || (committeeFilter !== ALL && member.committees?.find((item) => item.code === committeeFilter)?.pointsVisible === false)
                        ? "—"
                        : t("members.pointsUnit", { count: pointsFor(member, committeeFilter).toLocaleString() })}
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
                        {canManagePoints && canManageThisMemberPoints && member.id !== currentMember?.id && (
                          <button
                            type="button"
                            title={t("members.updatePoints")}
                            onClick={() => onOpenUpdatePoints({
                              ...member,
                              points: globalDeveloperLeader ? member.globalPoints ?? 0 : committeePointTarget?.points ?? member.points,
                              pointsCommitteeCode: globalDeveloperLeader ? undefined : committeePointTarget?.code,
                            })}
                            className="rounded-lg p-1.5 text-muted hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                          >
                            <Trophy className="size-4" />
                          </button>
                        )}

                        {/* Remove Member */}
                        {clubLeadership && canManageMembers && onOpenRemoveMember && (
                          <button
                            type="button"
                            title={t("members.remove")}
                            onClick={() => onOpenRemoveMember(member.email)}
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
        {sortedMembers.length > MEMBERS_PER_PAGE && (
          <div className="flex flex-col gap-3 border-t border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {t("members.showing", {
                from: (page - 1) * MEMBERS_PER_PAGE + 1,
                to: Math.min(page * MEMBERS_PER_PAGE, sortedMembers.length),
                count: sortedMembers.length,
              })}
              <span className="ms-2">{t("members.pageOf", { page, pages: pageCount })}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4 rtl:rotate-180" />
                {t("members.previous")}
              </button>
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
                disabled={page === pageCount}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("members.next")}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
