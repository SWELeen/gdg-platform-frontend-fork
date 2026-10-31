"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { LeaderGreeting } from "./LeaderGreeting";
import { LeadershipApprovalsPanel } from "./LeadershipApprovalsPanel";
import { LeaderDashboardStatus } from "./LeaderDashboardStatus";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";

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
  const { developerCommitteesOverview, dashboardLoading, dashboardError } = useLeaderDashboard();
  const [selectedCommittee, setSelectedCommittee] = useState("all");
  const visibleCommittees = selectedCommittee === "all"
    ? developerCommitteesOverview
    : developerCommitteesOverview.filter((item) => item.code === selectedCommittee);

  return (
    <div className="space-y-6">
      <LeaderGreeting />
      <LeaderDashboardStatus />
      <section className="space-y-3" aria-labelledby="developer-committee-overview-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="developer-committee-overview-title" className="text-lg font-bold">{t("overviewTitle")}</h2>
            <p className="mt-1 text-sm text-foreground/65">{t("developerDescription")}</p>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            {t("committeeFilter")}
            <select
              value={selectedCommittee}
              onChange={(event) => setSelectedCommittee(event.target.value)}
              className="h-10 min-w-56 rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
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
            {visibleCommittees.map((item) => (
              <article key={item.code} className="rounded-xl border border-border bg-surface p-4">
                <h3 className="font-semibold">{item.name}</h3>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div><dt className="text-foreground/60">{t("committeeMembers")}</dt><dd className="mt-1 font-semibold">{item.memberCount}</dd></div>
                  <div><dt className="text-foreground/60">{t("committeeLeaders")}</dt><dd className="mt-1 font-semibold">{item.leaderCount}</dd></div>
                  <div><dt className="text-foreground/60">{t("activeTasks")}</dt><dd className="mt-1 font-semibold">{item.activeTaskCount}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        ) : !dashboardLoading && !dashboardError ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">{t("noDeveloperCommittees")}</p>
        ) : null}
      </section>
      <LeadershipApprovalsPanel scope="DEVELOPER_COMMITTEES" />
    </div>
  );
}
