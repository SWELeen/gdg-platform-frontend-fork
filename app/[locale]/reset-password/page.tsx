import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { use } from "react"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"
import AuthCard from "@/app/components/auth/AuthCard"
import ResetPasswordForm from "./ResetPasswordForm"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/reset-password">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.resetPassword" })

  return { title: t("metaTitle") }
}

export default function ResetPassword({ params }: PageProps<"/[locale]/reset-password">) {
  // Tells next-intl the locale so this page can still be pre-rendered as static HTML.
  setRequestLocale(use(params).locale)
  const t = useTranslations("auth.resetPassword")

  return (
    <main className="flex min-h-screen min-w-0 flex-col bg-background text-foreground lg:h-screen lg:min-h-0 lg:flex-row">
      <AuthVisualPanel side="start" />

      <section className="flex flex-1 items-center justify-center bg-background lg:h-full">
        <AuthCard
          size="sm"
          title={t("title")}
          description={t("description")}
        >
          <ResetPasswordForm />
        </AuthCard>
      </section>
    </main>
  );
}
