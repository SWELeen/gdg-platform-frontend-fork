import { userRegistrationsMock } from "@/data/user-registrations";
import Footer from "@/components/Footer";
import { TopNav } from "@/components/dashboard/TopNav";
import { UserRegistrationsPage } from "@/components/user-registrations/UserRegistrationsPage";
import { setRequestLocale } from "next-intl/server";

export default async function RegistrationsPage({
  params,
}: PageProps<"/[locale]/registrations">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <TopNav />
      <UserRegistrationsPage result={process.env.NEXT_PUBLIC_USE_API === "true" ? null : { state: "ready", registrations: userRegistrationsMock }} />
      <Footer />
    </div>
  );
}
