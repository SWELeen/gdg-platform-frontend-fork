import { setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import { TopNav } from "@/components/dashboard/TopNav";
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

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <TopNav />
      <MemberEventDetails registration={registration} />
      <Footer />
    </div>
  );
}
