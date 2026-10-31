import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { use } from "react"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"
import AuthCard from "@/app/components/auth/AuthCard"
import VerifyCodeForm from "@/app/components/auth/VerifyCodeForm"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/signup/verify">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.verifyCode" })

  return { title: t("metaTitle") }
}

export default function VerifyCode({ params }: PageProps<"/[locale]/signup/verify">) {
  // Tells next-intl the locale so this page can still be pre-rendered as static HTML.
  setRequestLocale(use(params).locale)
  const t = useTranslations("auth.verifyCode")

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground lg:flex-row">
      <AuthVisualPanel side="start" animateOnMount={true} stretchOnDesktop />

      <section className="flex flex-1 items-center justify-center bg-background lg:h-full">
        <AuthCard
          size="sm"
          title={t("title")}
          description={t("description")}
        >
          <VerifyCodeForm />
        </AuthCard>
      </section>
    </main>
  )
}
