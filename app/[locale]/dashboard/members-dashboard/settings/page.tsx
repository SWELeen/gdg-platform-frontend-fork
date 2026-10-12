import { setRequestLocale } from "next-intl/server";
import { MemberSettingsPage } from "@/components/dashboard/members/settings/MemberSettingsPage";
import { getCurrentMemberProfile } from "@/lib/members/profile";

// Member-only settings. TopNav, sidebar, <main>, page <h1> and Footer come from the
// members-dashboard layout. Leader settings live in the leader workspaces and are not used here.
export default async function MemberSettingsRoute({
  params,
}: PageProps<"/[locale]/dashboard/members-dashboard/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getCurrentMemberProfile();

  return <MemberSettingsPage profile={profile} />;
}
