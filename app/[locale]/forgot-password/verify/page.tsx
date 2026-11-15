import { redirect } from "@/i18n/navigation";

// Old OTP recovery bookmarks now use the email-link recovery flow.
export default async function LegacyRecovery({ params }: PageProps<"/[locale]/forgot-password/verify">) {
  const { locale } = await params;
  redirect({ href: "/forgot-password", locale });
}
