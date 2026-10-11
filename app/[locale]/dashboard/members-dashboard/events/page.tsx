import { setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import { TopNav } from "@/components/dashboard/TopNav";
import { MemberEventsPage } from "@/components/dashboard/member/MemberEventsPage";
import { getCurrentUserRegistrations } from "@/lib/user-registrations/repository";

export default async function MemberEventsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/events">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getCurrentUserRegistrations();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <TopNav />
      <MemberEventsPage result={result} />
      <Footer />
    </div>
  );
}
