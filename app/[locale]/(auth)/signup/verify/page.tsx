import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { use } from "react"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"
import AuthFormPanel from "@/app/components/auth/AuthFormPanel"
import AuthCard from "@/app/components/auth/AuthCard"
import VerificationEmailForm from "@/app/components/auth/VerificationEmailForm"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/signup/verify">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.verificationEmail" })

  return { title: t("metaTitle") }
}

export default function VerifyCode({ params }: PageProps<"/[locale]/signup/verify">) {
  // Tells next-intl the locale so this page can still be pre-rendered as static HTML.
  setRequestLocale(use(params).locale)
  const t = useTranslations("auth.verificationEmail")

  return (
    <main className="flex min-h-screen min-w-0 flex-col bg-background text-foreground lg:h-screen lg:min-h-0 lg:flex-row">
      <AuthVisualPanel side="start" animateOnMount={true} />

      <AuthFormPanel>
        <AuthCard
          size="sm"
          title={t("title")}
          description={t("description")}
        >
          <VerificationEmailForm />
        </AuthCard>
      </AuthFormPanel>
    </main>
  )
}