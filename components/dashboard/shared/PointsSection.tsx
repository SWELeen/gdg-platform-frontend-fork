"use client";

import { useState } from "react";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { useTranslations } from "next-intl";
import type { CommitteeMember } from "./types";
import { ALL, CommitteeFilterSelect, CommitteeTag, matchesCommittee, pointsFor, useClubCommittees } from "./ClubFilters";
import { ArrowUpRight, ArrowDownRight, History, Search } from "lucide-react";

interface PointsSectionProps {
  onOpenUpdatePoints: (member: CommitteeMember) => void;
}

export function PointsSection({ onOpenUpdatePoints }: PointsSectionProps) {
  const { members, pointHistory, canManagePoints, clubLeadership } = useLeaderDashboard();
  const committees = useClubCommittees();
  const t = useTranslations("dashboard.leader");
  const [committeeFilter, setCommitteeFilter] = useState(ALL);
  const [searchTerm, setSearchTerm] = useState("");

  const search = searchTerm.trim().toLowerCase();
  const filteredMembers = members.filter(
    (m) => matchesCommittee(m, committeeFilter) && (!search || m.name.toLowerCase().includes(search))
  );
  const filteredHistory = pointHistory.filter(
    (item) =>
      (committeeFilter === ALL || item.committeeCode === committeeFilter) &&
      (!search || item.memberName.toLowerCase().includes(search))
  );
  const filtersActive = committeeFilter !== ALL || Boolean(search);
  const selectedCommitteeName = committees.find((item) => item.code === committeeFilter)?.name;
  const totalPoints = filteredMembers.reduce((sum, m) => sum + pointsFor(m, committeeFilter), 0);

  return (
    <div className="space-y-6">
      {/* Total points summary */}
      <div className="rounded-xl border border-border border-s-4 border-s-blue-500 bg-surface p-4 shadow-2xs sm:p-5">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {t("points.totalBanner", { points: totalPoints.toLocaleString() })}
        </h2>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          {t("points.description")}
        </p>
      </div>

      {/* Member Points Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-border/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {t("points.standings")}
            </h3>
          </div>
          {clubLeadership && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("groupFilters.searchMember")}
                  className="h-9 rounded-xl border border-border bg-surface-muted/40 ps-8 pe-3 text-xs text-foreground outline-none focus:border-blue-500"
                />
              </div>
              <CommitteeFilterSelect value={committeeFilter} onChange={setCommitteeFilter} />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5 text-start">{t("points.member")}</th>
                <th className="px-4 py-3.5 text-start">{t("points.role")}</th>
                <th className="px-4 py-3.5 text-start">
                  {selectedCommitteeName ? t("groupFilters.pointsIn", { committee: selectedCommitteeName }) : t("points.currentPoints")}
                </th>
                <th className="px-4 py-3.5 text-start">{t("points.tasksCompleted")}</th>
                <th className="px-4 py-3.5 text-start">{t("points.lastUpdated")}</th>
                <th className="px-5 py-3.5 text-end">{t("points.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    {filtersActive ? t("groupFilters.noMembers") : t("points.emptyMembers")}
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="transition hover:bg-surface-muted/20">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${member.avatarBgColor}`}
                      >
                        {member.initials}
                      </div>
                      <span className="font-bold text-foreground">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{member.role}</td>
                  <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {pointsFor(member, committeeFilter).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/80">{member.tasksCompleted}</td>
                  <td className="px-4 py-3.5 text-muted">{member.lastActivity}</td>
                  <td className="px-5 py-3.5 text-end">
                    {canManagePoints && (
                      <button
                        type="button"
                        onClick={() => onOpenUpdatePoints(member)}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
                      >
                        {t("points.updatePoints")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <History className="size-4 text-blue-500" />
          <h3 className="text-sm font-bold text-foreground">
            {t("points.history")}
          </h3>
        </div>

        <div className="mt-3 divide-y divide-border/60 text-xs">
          {filteredHistory.length === 0 ? (
            <p className="py-4 text-sm text-muted">{filtersActive ? t("groupFilters.noHistory") : t("points.emptyHistory")}</p>
          ) : filteredHistory.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex size-6 items-center justify-center rounded-full ${
                    item.pointsDelta >= 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}
                >
                  {item.pointsDelta >= 0 ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-foreground">
                    {item.memberName}:
                  </span>{" "}
                  <span className="text-muted">{item.reason}</span>
                  {clubLeadership && <span className="ms-2"><CommitteeTag code={item.committeeCode} name={item.committeeName} /></span>}
                </div>
              </div>

              <div className="flex items-center gap-3 ps-8 sm:ps-0">
                <span
                  className={`font-bold ${
                    item.pointsDelta >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {item.pointsDelta >= 0 ? `+${item.pointsDelta}` : item.pointsDelta} pts
                </span>
                <span className="text-[11px] text-muted">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
