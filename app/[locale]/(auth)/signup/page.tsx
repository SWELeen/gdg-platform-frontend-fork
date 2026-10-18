import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { use } from "react"
import { Link } from "@/i18n/navigation"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"
import AuthFormPanel from "@/app/components/auth/AuthFormPanel"
import AuthCard from "@/app/components/auth/AuthCard"
import SignupFlow from "./components/SignupForm"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/signup">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.signup" })

  return { title: t("metaTitle") }
}

export default function SignUp({ params }: PageProps<"/[locale]/signup">) {
  // Tells next-intl the locale so this page can still be pre-rendered as static HTML.
  setRequestLocale(use(params).locale)
  const t = useTranslations("auth.signup")

  return (
    // Keep the split auth layout on desktop while letting the long signup form scroll.
    <main className="flex min-h-screen min-w-0 flex-col bg-background text-foreground lg:h-dvh lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <AuthFormPanel scrollableOnDesktop>
        <AuthCard
          size="lg"
          description=""
          className="my-8 shrink-0 lg:mt-6 lg:mb-8"
        >
          <SignupFlow />

          <p className="mt-8 pb-6 text-center text-sm text-foreground/55 lg:mt-8 lg:pb-6">
            {t("haveAccount")}
            <Link
              href="/login"
              className="ms-1 font-bold text-blue hover:text-blue/90 active:text-blue/80"
            >
              {t("signIn")}
            </Link>
          </p>
        </AuthCard>
      </AuthFormPanel>

      <AuthVisualPanel
        side="end"
        animateOnMount
      />
    </main>
  );
}
