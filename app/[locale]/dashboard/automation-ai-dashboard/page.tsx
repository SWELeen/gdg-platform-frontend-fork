import { redirect } from "next/navigation";

export default async function LegacyAutomationDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/automation-dashboard`);
}
