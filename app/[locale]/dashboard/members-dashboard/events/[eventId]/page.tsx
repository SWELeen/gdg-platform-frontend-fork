import { setRequestLocale } from "next-intl/server";
import { MemberEventDetails } from "@/components/dashboard/member/MemberEventDetails";
import { getCurrentUserRegistrations } from "@/lib/user-registrations/repository";

export default async function MemberEventDetailsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/events/[eventId]">) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const result = await getCurrentUserRegistrations();
  const registration =
    result.state === "ready"
      ? result.registrations.find((item) => item.id === eventId) ?? null
      : null;

  // TopNav, sidebar, <main> and Footer come from the members-dashboard layout.
  return <MemberEventDetails registration={registration} />;
}
