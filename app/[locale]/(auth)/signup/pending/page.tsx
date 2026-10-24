import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { use } from "react"
import AuthCard from "@/app/components/auth/AuthCard"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.signupPending" })
  return { title: t("title") }
}

export default function SignupPendingPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale)
  const t = useTranslations("auth.signupPending")
  return (
    <main className="flex min-h-screen min-w-0 flex-col bg-white text-primary-font lg:h-screen lg:flex-row">
      <AuthVisualPanel side="start" animateOnMount />
      <section className="flex flex-1 items-center justify-center bg-white">
          <AuthCard size="sm" title={t("title")} description={t("description")}>
            <p className="mt-4 text-center text-sm text-foreground/65">{t("description")}</p>
          </AuthCard>
      </section>
    </main>
  )
}
