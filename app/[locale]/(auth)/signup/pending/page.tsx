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
    <main className="flex min-h-screen min-w-0 flex-col bg-background text-foreground lg:h-screen lg:flex-row">
      <AuthVisualPanel side="start" animateOnMount />
      <section className="flex flex-1 items-center justify-center bg-background lg:h-full">
        <AuthCard
          size="sm"
          compact
          title={t("title")}
          description={t("description")}
          className="md:h-80!"
        >
          <div aria-hidden="true" className="flex flex-1 items-center justify-center pb-8">
            <span className="flex size-16 items-center justify-center rounded-full bg-gdg-green/10 text-gdg-green">
              <svg viewBox="0 0 24 24" fill="none" className="size-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
          </div>
        </AuthCard>
      </section>
    </main>
  )
}
