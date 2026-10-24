"use client";

import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { LeaderGreeting } from "./LeaderGreeting";
import { LeadershipApprovalsPanel } from "./LeadershipApprovalsPanel";
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
          <header><h1 className="text-3xl font-bold">{t("clubTitle")}</h1></header>
          <LeadershipApprovalsPanel scope="CLUB" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DeveloperCommitteesDashboard() {
  const t = useTranslations("dashboard.leadershipDashboard");
  const { developerCommitteesOverview } = useLeaderDashboard();

  return (
    <div className="space-y-6">
      <LeaderGreeting />
      <section className="space-y-3" aria-labelledby="developer-committee-overview-title">
        <div>
          <h2 id="developer-committee-overview-title" className="text-lg font-bold">{t("overviewTitle")}</h2>
          <p className="mt-1 text-sm text-foreground/65">{t("developerDescription")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {developerCommitteesOverview.map((item) => (
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
      </section>
      <LeadershipApprovalsPanel scope="DEVELOPER_COMMITTEES" />
    </div>
  );
}
