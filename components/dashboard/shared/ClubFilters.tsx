"use client";

import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { committeeTranslationKeys, leaderCommitteeConfig } from "./committee-config";
import type { CommitteeMember, CommitteeOption, LeaderCommittee } from "./types";

export const ALL = "all";

// Same order as the landing page committees section.
const OFFICIAL_COMMITTEES: LeaderCommittee[] = [
  "content-writing",
  "project-management",
  "digital-media-design",
  "pr",
  "web-development",
  "artificial-intelligence",
  "robotics-iot",
  "cybersecurity",
  "automation",
  "data-analysis",
];

/** Every official committee, even ones with no database row yet, then any other committee the backend returned. */
export function useClubCommittees(): CommitteeOption[] {
  const t = useTranslations("dashboard.leader");
  const { committees } = useLeaderDashboard();
  const official = OFFICIAL_COMMITTEES.map((key) => ({
    code: leaderCommitteeConfig[key].committeeCode,
    name: t(`nav.${committeeTranslationKeys[key]}`),
  }));
  const officialCodes = new Set(official.map((item) => item.code));
  return [...official, ...committees.filter((item) => !officialCodes.has(item.code))];
}

/** Translated committee name by code, falling back to the backend name. */
export function useCommitteeName() {
  const names = new Map(useClubCommittees().map((item) => [item.code, item.name]));
  return (code?: string, fallback?: string) => (code && names.get(code)) || fallback || code || "";
}

const SELECT_CLASS =
  "h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground outline-none focus:border-blue-500 cursor-pointer";

export function CommitteeFilterSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("dashboard.leader.groupFilters");
  const committees = useClubCommittees();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={t("committee")} className={SELECT_CLASS}>
      <option value={ALL}>{t("allCommittees")}</option>
      {committees.map((committee) => (
        <option key={committee.code} value={committee.code}>{committee.name}</option>
      ))}
    </select>
  );
}

export const ROLE_FILTERS = ["Leader", "Co-Leader", "Member", "CLUB_LEADERSHIP", "ADVISOR"] as const;

export function RoleFilterSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("dashboard.leader.groupFilters");
  const labels: Record<(typeof ROLE_FILTERS)[number], string> = {
    Leader: t("roleLeader"),
    "Co-Leader": t("roleCoLeader"),
    Member: t("roleMember"),
    CLUB_LEADERSHIP: t("roleGroupLeadership"),
    ADVISOR: t("roleAdvisor"),
  };
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={t("allRoles")} className={SELECT_CLASS}>
      <option value={ALL}>{t("allRoles")}</option>
      {ROLE_FILTERS.map((role) => (
        <option key={role} value={role}>{labels[role]}</option>
      ))}
    </select>
  );
}

export function matchesCommittee(member: CommitteeMember, committee: string) {
  if (committee === ALL) return true;
  return (member.committees ?? []).some((item) => item.code === committee);
}

/** Committee positions are checked inside the selected committee, or in any committee when none is selected. */
export function matchesRole(member: CommitteeMember, role: string, committee: string) {
  if (role === ALL) return true;
  const globalRoles = member.globalRoles ?? [];
  if (role === "CLUB_LEADERSHIP") return globalRoles.includes("GROUP_LEADER") || globalRoles.includes("GROUP_CO_LEADER");
  if (role === "ADVISOR") return globalRoles.includes("ADVISOR");
  return (member.committees ?? []).some(
    (item) => item.role === role && (committee === ALL || item.code === committee),
  );
}

/** Points for the selected committee, or the member's total across committees. */
export function pointsFor(member: CommitteeMember, committee: string) {
  if (committee === ALL) return member.points;
  return member.committees?.find((item) => item.code === committee)?.points ?? 0;
}

export function CommitteeBadges({ member }: { member: CommitteeMember }) {
  const t = useTranslations("dashboard.leader.groupFilters");
  const committeeName = useCommitteeName();
  const memberCommittees = member.committees ?? [];
  if (memberCommittees.length === 0) return <span className="text-muted">{t("noCommittee")}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {memberCommittees.map((item) => (
        <span
          key={item.code}
          className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
        >
          {committeeName(item.code, item.name)} · {item.role}
        </span>
      ))}
    </div>
  );
}

export function CommitteeTag({ code, name }: { code?: string; name?: string }) {
  const committeeName = useCommitteeName();
  if (!code && !name) return null;
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {committeeName(code, name)}
    </span>
  );
}
