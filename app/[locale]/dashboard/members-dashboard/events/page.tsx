import { setRequestLocale } from "next-intl/server";
import { MemberEventsPage } from "@/components/dashboard/member/MemberEventsPage";
import { getCurrentUserRegistrations } from "@/lib/user-registrations/repository";

export default async function MemberEventsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/events">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getCurrentUserRegistrations();

  // TopNav, sidebar, <main> and Footer come from the members-dashboard layout.
  return <MemberEventsPage result={result} />;
}
