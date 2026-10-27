import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeaderOverview } from "@/components/dashboard/shared/LeaderOverview";
import { LeadershipApprovalsPanel } from "@/components/dashboard/shared/LeadershipApprovalsPanel";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.leadershipDashboard" });
  return { title: t("clubTitle") };
}

export default async function ClubLeadershipDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div className="space-y-7">
    <LeaderOverview />
    <LeadershipApprovalsPanel scope="CLUB" />
  </div>;
}
