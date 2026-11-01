import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnnouncementManagementPanel } from "@/components/dashboard/shared/AnnouncementManagementPanel";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.leadershipDashboard" });
  return { title: t("announcementsTitle") };
}

export default async function ClubLeadershipAnnouncementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AnnouncementManagementPanel />;
}
