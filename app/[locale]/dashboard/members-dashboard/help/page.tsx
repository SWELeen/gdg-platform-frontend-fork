import { setRequestLocale } from "next-intl/server";
import { MemberHelpPage } from "@/components/dashboard/members/help/MemberHelpPage";

// TopNav, sidebar, <main>, page <h1> and Footer come from the members-dashboard layout.
export default async function MemberHelpRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/help">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MemberHelpPage />;
}
