import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { use } from "react"
import type { CSSProperties } from "react"
import AuthCard from "@/app/components/auth/AuthCard"
import AuthVisualPanel from "@/app/components/auth/AuthVisualPanel"

const confetti = [
  { x: -220, y: -220, rotate: -150, color: "#4285F4", shape: "rect" },
  { x: -150, y: -250, rotate: 70, color: "#34A853", shape: "circle" },
  { x: -70, y: -230, rotate: 220, color: "#FBBC04", shape: "rect" },
  { x: 20, y: -265, rotate: -60, color: "#EA4335", shape: "circle" },
  { x: 115, y: -245, rotate: 130, color: "#4285F4", shape: "rect" },
  { x: 195, y: -220, rotate: -210, color: "#34A853", shape: "circle" },
  { x: 230, y: -150, rotate: 30, color: "#FBBC04", shape: "rect" },
  { x: 215, y: -75, rotate: 170, color: "#EA4335", shape: "circle" },
  { x: 235, y: 10, rotate: 260, color: "#FBBC04", shape: "rect" },
  { x: 205, y: 95, rotate: -30, color: "#EA4335", shape: "circle" },
  { x: 150, y: 155, rotate: 110, color: "#4285F4", shape: "rect" },
  { x: 65, y: 175, rotate: -120, color: "#34A853", shape: "circle" },
  { x: -30, y: 170, rotate: 200, color: "#EA4335", shape: "rect" },
  { x: -125, y: 150, rotate: -80, color: "#FBBC04", shape: "circle" },
  { x: -205, y: 105, rotate: 50, color: "#34A853", shape: "rect" },
  { x: -235, y: 30, rotate: -170, color: "#4285F4", shape: "circle" },
  { x: -230, y: -65, rotate: -95, color: "#EA4335", shape: "rect" },
  { x: -125, y: -100, rotate: 45, color: "#34A853", shape: "circle" },
  { x: -35, y: -115, rotate: 135, color: "#4285F4", shape: "rect" },
  { x: 65, y: -105, rotate: -45, color: "#FBBC04", shape: "circle" },
  { x: 145, y: -95, rotate: 200, color: "#EA4335", shape: "rect" },
  { x: 145, y: 25, rotate: 85, color: "#34A853", shape: "circle" },
  { x: -120, y: 5, rotate: -125, color: "#FBBC04", shape: "rect" },
  { x: -90, y: 90, rotate: 160, color: "#4285F4", shape: "circle" },
] as const

type ConfettiStyle = CSSProperties & {
  "--confetti-x": string
  "--confetti-y": string
  "--confetti-rotation": string
  "--confetti-delay": string
  "--confetti-color": string
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.signupPending" })
  return { title: t("title") }
}

export default function SignupPendingPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale)
  const t = useTranslations("auth.signupPending")
  return (
    <main className="flex min-h-screen min-w-0 flex-col bg-background text-foreground lg:h-screen lg:min-h-0 lg:flex-row">
      <AuthVisualPanel side="start" animateOnMount />
      <section className="flex flex-1 items-center justify-center bg-background px-4 py-12 lg:h-full lg:px-0 lg:py-0">
        <AuthCard
          size="sm"
          compact
          title={t("title")}
          description={t("description")}
          className="signup-pending-card max-w-[22rem] md:max-w-none md:h-80!"
        >
          <div className="signup-pending-visual">
            <div aria-hidden="true" className="signup-pending-decoration">
              {confetti.map((piece, index) => (
              <span
                key={index}
                className={`signup-confetti-piece ${piece.shape === "circle" ? "rounded-full" : "rounded-sm"}`}
                style={{
                  "--confetti-x": `${piece.x}px`,
                  "--confetti-y": `${piece.y}px`,
                  "--confetti-rotation": `${piece.rotate}deg`,
                  "--confetti-delay": `${index * 24}ms`,
                  "--confetti-color": piece.color,
                } as ConfettiStyle}
              />
            ))}
              <span className="signup-success-pop flex size-16 items-center justify-center rounded-full bg-[image:var(--google-gradient)] text-white">
              <svg viewBox="0 0 24 24" fill="none" className="size-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 4 4L19 6" />
              </svg>
              </span>
            </div>
          </div>
        </AuthCard>
      </section>
    </main>
  )
}
