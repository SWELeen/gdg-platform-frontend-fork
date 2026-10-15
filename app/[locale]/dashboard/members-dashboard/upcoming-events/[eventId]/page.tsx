import { setRequestLocale } from "next-intl/server";
import { UpcomingEventDetails } from "@/components/dashboard/member/UpcomingEventDetails";
import { getPublishedEventById } from "@/lib/events/repository";

export default async function UpcomingEventDetailsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/upcoming-events/[eventId]">) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const event = (await getPublishedEventById(eventId)) ?? null;

  // TopNav, sidebar, <main> and Footer come from the members-dashboard layout.
  return <UpcomingEventDetails event={event} />;
}
