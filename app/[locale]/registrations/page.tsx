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
      <UserRegistrationsPage />
      <Footer />
    </div>
  );
}
