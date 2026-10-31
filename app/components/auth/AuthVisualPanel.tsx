"use client"

import { motion, type Variants } from "framer-motion"
import { useTranslations } from "next-intl"
import useDesktopMediaQuery from "@/app/lib/useDesktopMediaQuery"
import { useTextDirection } from "@/i18n/useTextDirection"

type AuthVisualPanelProps = {
  // Logical side: "start" is left in English and right in Arabic.
  side: "start" | "end"
  animateOnMount?: boolean
}

const contentGroupVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const barsGroupVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.25
    }
  }
}

// Framer Motion's x is physical, so work out which screen edge the bars slide in from.
function getBarVariants(fromLeft: boolean): Variants {
  return {
    hidden: { x: fromLeft ? "-100%" : "100%" },
    visible: {
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }
}

export default function AuthVisualPanel({
  side,
  animateOnMount = false
}: AuthVisualPanelProps) {
  const t = useTranslations("auth.visualPanel")
  const dir = useTextDirection()
  const isStart = side === "start"
  const isDesktop = useDesktopMediaQuery()
  const barPosition = isStart ? "start-0" : "end-0"
  const shouldAnimate = animateOnMount && isDesktop
  const barVariants = getBarVariants(isStart === (dir === "ltr"))

  return (
    <motion.section
      layoutId={isDesktop ? "auth-visual-panel" : undefined}
      transition={isDesktop ? { duration: 0.6, ease: "easeInOut" } : undefined}
      className={`
        relative z-20 hidden h-full w-full flex-col overflow-hidden bg-auth-visual-background text-gdg-dark px-8.5 pt-8.75 shadow-[0_0_15px_rgba(0,0,0,0.15)] lg:flex lg:h-[calc(100%-4rem)] lg:w-[48%] lg:self-start
        ${isStart ? "rounded-se-[30px] rounded-ee-[30px]" : "rounded-ss-[30px] rounded-es-[30px]"}`}
    >
      <motion.div
        variants={contentGroupVariants}
        initial={shouldAnimate ? "hidden" : false}
        animate={isDesktop ? "visible" : false}
      >
        <div className="mt-14">
          <p className="text-base font-bold tracking-[2px] text-gdg-blue">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2.25 text-5xl font-bold leading-tight">
            {t("headline")}
            <span className="block text-gdg-blue">{t("headlineAccent")}</span>
          </h1>
          <p className="mt-4.25 max-w-95 text-sm leading-normal">
            {t("descriptionLine1")}
            <br />
            {t("descriptionLine2")}
          </p>
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        variants={barsGroupVariants}
        initial={shouldAnimate ? "hidden" : false}
        animate={isDesktop ? "visible" : false}
      >
        <motion.div
          variants={barVariants}
          className={`absolute bottom-0 h-6 w-full bg-gdg-yellow ${barPosition}`}
        />
        <motion.div
          variants={barVariants}
          className={`absolute bottom-6 h-6 w-[80%] bg-gdg-red ${barPosition}`}
        />
        <motion.div
          variants={barVariants}
          className={`absolute bottom-12 h-6 w-[60%] bg-gdg-blue ${barPosition}`}
        />
        <motion.div
          variants={barVariants}
          className={`absolute bottom-18 h-6 w-[40%] bg-gdg-green ${barPosition}`}
        />
      </motion.div>
    </motion.section>
  )
}
