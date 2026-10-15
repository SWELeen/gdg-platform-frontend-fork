import { setRequestLocale } from "next-intl/server";
import { UpcomingEventsPage } from "@/components/dashboard/member/UpcomingEventsPage";
import { getPublishedEvents } from "@/lib/events/repository";

export default async function UpcomingEventsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/upcoming-events">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const events = await getPublishedEvents();

  // TopNav, sidebar, <main> and Footer come from the members-dashboard layout.
  return <UpcomingEventsPage events={events} />;
}
