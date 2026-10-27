import { redirect } from 'next/navigation';

export default async function MemberEventsRedirect({
  params,
}: PageProps<'/[locale]/dashboard/members-dashboard/events'>) {
  const { locale } = await params;
  redirect(`/${locale}/registrations`);
}
