import { redirect } from 'next/navigation';

export default async function MemberEventDetailsRedirect({
  params,
}: PageProps<'/[locale]/dashboard/members-dashboard/events/[eventId]'>) {
  const { locale } = await params;
  redirect(`/${locale}/registrations`);
}
