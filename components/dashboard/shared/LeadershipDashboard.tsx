"use client";

import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { LeaderGreeting } from "./LeaderGreeting";
import { LeadershipApprovalsPanel } from "./LeadershipApprovalsPanel";
import { LeaderDashboardStatus } from "./LeaderDashboardStatus";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { committees } from "@/lib/badge/themes";
import { AssignPersonModal } from "./AssignPersonModal";
import { PointsModal } from "./PointsModal";
import type { CommitteeMember } from "./types";

const developerCommitteeAccents: Record<string, string> = {
  DATA: committees.DATA.theme.bg,
  CYBER: committees.CYBER.theme.bg,
  AI: committees.AI.theme.bg,
  AUTOMATION: committees.AUTOMATION.theme.bg,
  ROBOTICS: committees.ROBOTICS.theme.bg,
  WEB: committees.WEB.theme.bg,
};

export function LeadershipDashboard({ scope }: { scope: "CLUB" | "DEVELOPER_COMMITTEES" }) {
  return scope === "CLUB" ? <ClubLeadershipDashboard /> : <DeveloperCommitteesDashboard />;
}

function ClubLeadershipDashboard() {
  const t = useTranslations("dashboard.leadershipDashboard");
  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <TopNav />
      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header><h1 className="text-3xl font-bold">{t("groupTitle")}</h1></header>
          <LeadershipApprovalsPanel scope="CLUB" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DeveloperCommitteesDashboard() {
  const t = useTranslations("dashboard.leadershipDashboard");
  const membersT = useTranslations("dashboard.leader.members");
  const { developerCommitteesOverview, members, canAssignDeveloperMembers, canManagePoints, currentMember, dashboardLoading, dashboardError } = useLeaderDashboard();
  const [selectedCommittee, setSelectedCommittee] = useState("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [pointsMember, setPointsMember] = useState<CommitteeMember | null>(null);
  const visibleCommittees = selectedCommittee === "all"
    ? developerCommitteesOverview
    : developerCommitteesOverview.filter((item) => item.code === selectedCommittee);
  const visibleLeaders = members.filter((member) => member.committees?.some((item) => visibleCommittees.some((committee) => committee.code === item.code)));

  return (
    <div className="space-y-6">
      <LeaderGreeting />
      <LeaderDashboardStatus />
      <section className="space-y-3" aria-labelledby="developer-committee-overview-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 id="developer-committee-overview-title" className="text-lg font-bold">{t("overviewTitle")}</h2>
            {canAssignDeveloperMembers && <button type="button" onClick={() => setAssignOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Plus className="size-3.5" />{membersT("add")}</button>}
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground/85">
            {t("committeeFilter")}
            <select
              value={selectedCommittee}
              onChange={(event) => setSelectedCommittee(event.target.value)}
              className="h-10 min-w-56 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">{t("allCommittees")}</option>
              {developerCommitteesOverview.map((item) => (
                <option key={item.code} value={item.code}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
        {visibleCommittees.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCommittees.map((item) => {
              const accent = developerCommitteeAccents[item.code] ?? "var(--gdg-blue)";
              const accentSurface = `color-mix(in srgb, ${accent} 7%, var(--surface))`;
              const accentBorder = `color-mix(in srgb, ${accent} 30%, var(--border))`;

              return (
                <article
                  key={item.code}
                  className="overflow-hidden rounded-2xl border bg-surface shadow-sm transition-shadow hover:shadow-md"
                  style={{
                    borderColor: accentBorder,
                    borderInlineStart: `4px solid ${accent}`,
                    backgroundColor: accentSurface,
                  }}
                >
                  <div className="p-4 sm:p-5">
                    <header className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                        <h3 className="truncate text-base font-bold text-foreground">{item.name}</h3>
                      </div>
                      <span className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide text-foreground/85" style={{ borderColor: accentBorder, backgroundColor: accentSurface }}>
                        {item.code}
                      </span>
                    </header>
                    <dl className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: t("committeeMembers"), value: item.memberCount },
                        { label: t("committeeLeaders"), value: item.leaderCount },
                        { label: t("activeTasks"), value: item.activeTaskCount },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-xl border px-2 py-3 text-center sm:px-3" style={{ borderColor: accentBorder, backgroundColor: accentSurface }}>
                          <dt className="min-h-8 text-xs font-medium leading-4 text-foreground/75">{metric.label}</dt>
                          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{metric.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="h-1 w-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        ) : !dashboardLoading && !dashboardError ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm font-medium text-foreground/75">{t("noDeveloperCommittees")}</p>
        ) : null}
      </section>
      {canManagePoints && <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-foreground">{t("committeeLeaders")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-start text-sm">
            <thead><tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
              <th className="px-5 py-3 text-start">{membersT("member")}</th>
              <th className="px-4 py-3 text-start">{membersT("role")}</th>
              <th className="px-4 py-3 text-start">{membersT("points")}</th>
              <th className="px-5 py-3 text-end">{membersT("actions")}</th>
            </tr></thead>
            <tbody className="divide-y divide-border/60">
              {visibleLeaders.map((member) => <tr key={`${member.id}-${member.pointsCommitteeCode}`}>
                <td className="px-5 py-3 font-semibold text-foreground">{member.name}</td>
                <td className="px-4 py-3 text-muted">{member.role}</td>
                <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{member.pointsVisible === false ? "—" : member.points.toLocaleString()}</td>
                <td className="px-5 py-3 text-end">
                  {member.pointsVisible !== false && member.id !== currentMember?.id && <button type="button" title={membersT("updatePoints")} aria-label={membersT("updatePoints")} onClick={() => setPointsMember(member)} className="rounded-lg p-1.5 text-muted hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"><Trophy className="size-4" /></button>}
                </td>
              </tr>)}
              {visibleLeaders.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">{t("noDeveloperCommittees")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>}
      <PointsModal isOpen={Boolean(pointsMember)} onClose={() => setPointsMember(null)} member={pointsMember} />
      <LeadershipApprovalsPanel scope="DEVELOPER_COMMITTEES" />
      <AssignPersonModal isOpen={assignOpen} onClose={() => setAssignOpen(false)} scope="developer" />
    </div>
  );
}
