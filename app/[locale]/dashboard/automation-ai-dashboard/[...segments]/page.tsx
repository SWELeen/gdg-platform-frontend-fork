import { redirect } from "next/navigation";

export default async function LegacyAutomationDashboardSection({ params }: { params: Promise<{ locale: string; segments: string[] }> }) {
  const { locale, segments } = await params;
  const suffix = segments.map((segment) => encodeURIComponent(segment)).join("/");
  redirect(`/${locale}/dashboard/automation-dashboard/${suffix}`);
}
