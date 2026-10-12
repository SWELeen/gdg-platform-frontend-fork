import { setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import { TopNav } from "@/components/dashboard/TopNav";
import { UpcomingEventDetails } from "@/components/dashboard/member/UpcomingEventDetails";
import { getPublishedEventById } from "@/lib/events/repository";

export default async function UpcomingEventDetailsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/upcoming-events/[eventId]">) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const event = (await getPublishedEventById(eventId)) ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <TopNav />
      <UpcomingEventDetails event={event} />
      <Footer />
    </div>
  );
}
