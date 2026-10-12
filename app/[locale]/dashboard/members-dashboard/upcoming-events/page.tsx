import { setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import { TopNav } from "@/components/dashboard/TopNav";
import { UpcomingEventsPage } from "@/components/dashboard/member/UpcomingEventsPage";
import { getPublishedEvents } from "@/lib/events/repository";

export default async function UpcomingEventsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/upcoming-events">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const events = await getPublishedEvents();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <TopNav />
      <UpcomingEventsPage events={events} />
      <Footer />
    </div>
  );
}
