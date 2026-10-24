import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadershipDashboard } from "@/components/dashboard/shared/LeadershipDashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.leadershipDashboard" });
  return { title: t("developerTitle") };
}

export default async function DeveloperCommitteesDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LeadershipDashboard scope="DEVELOPER_COMMITTEES" />;
}
