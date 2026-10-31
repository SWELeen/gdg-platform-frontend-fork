import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"
import AuthFormPanel from "@/app/components/auth/AuthFormPanel"
import LoginFlow from "./components/LoginFlow"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.login" })

  return { title: t("metaTitle") }
}

export default function LogIn() {
  return (
    <main className="flex min-h-screen min-w-0 flex-col bg-background text-foreground lg:h-screen lg:min-h-0 lg:flex-row">
      <AuthVisualPanel
        side="start"
        animateOnMount={true}
      />

      <AuthFormPanel>
        <LoginFlow />
      </AuthFormPanel>
    </main>
  )
}
