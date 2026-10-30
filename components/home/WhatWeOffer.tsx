"use client";

import { offers } from "@/data/home";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { useRef, useState } from "react";

export default function WhatWeOffer() {
  const t = useTranslations("home.offers");
  const dir = useTextDirection();
  // Framer Motion x is physical: flip the slide-in direction in RTL.
  const sign = dir === "rtl" ? -1 : 1;
  const [activeStep, setActiveStep] = useState(1);
  const mobileSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mobileSectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const step = Math.min(
      Math.floor(progress * offers.length) + 1,
      offers.length
    );

    setActiveStep((previousStep) =>
      previousStep === step ? previousStep : step
    );
  });

  return (
    <section
      id="offers"
      className="relative isolate overflow-hidden bg-background px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 opacity-100">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="gdg-offers-wave-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--gdg-blue)" />
              <stop offset="33%" stopColor="var(--gdg-green)" />
              <stop offset="66%" stopColor="var(--gdg-yellow)" />
              <stop offset="100%" stopColor="var(--gdg-red)" />
            </linearGradient>
          </defs>
          <path
            d="M0 80 C180 10 300 62 480 44 S780 14 960 50 S1260 64 1440 42"
            fill="none"
            stroke="url(#gdg-offers-wave-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--gdg-blue)_12%,transparent)_48%,color-mix(in_srgb,var(--gdg-blue)_30%,transparent)_100%)]" /> */}

      <div className="relative max-w-2xl">
        <h2 dir={dir} className="text-3xl font-bold leading-snug text-foreground md:text-4xl">
          {t("title")}
        </h2>
      </div>

      {/* ===================================================== */}
      {/* DESKTOP / LAPTOP */}
      {/* ===================================================== */}

      <div className="mt-10 hidden h-[130px] gap-6 lg:flex">
        {offers.map((offer) => {
          const isActive = activeStep === offer.number;

          return (
            <div
              key={offer.number}
              onMouseEnter={() => setActiveStep(offer.number)}
              className={`flex h-full min-w-0 cursor-pointer flex-col transition-[flex] duration-500 ease-out ${
                isActive ? "flex-[2]" : "flex-1"
              }`}
            >
              {/* Top Line */}
              <motion.div
                animate={{
                  width: isActive ? "100%" : "80px",
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="h-[2px]"
                style={{
                  backgroundColor: isActive
                    ? offer.color
                    : "var(--muted)",
                }}
              />

              {/* Number + Content */}
              <div className="mt-1 flex h-[120px] items-center gap-6">
                {/* Number */}
                <h1
                  className="shrink-0 text-7xl font-normal xl:text-8xl"
                  style={{
                    color: offer.color,
                  }}
                >
                  {offer.number}
                </h1>

                {/* Active Content */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={offer.number}
                      initial={{
                        opacity: 0,
                        x: 8 * sign,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -15 * sign,
                        transition: { duration: 0 },
                      }}
                      transition={{
                        duration: 0.35,
                        delay: 0.5,
                        ease: "easeOut",
                      }}
                      className="min-w-0 overflow-hidden"
                    >
                      <h3 dir={dir} className="text-2xl font-semibold leading-snug">
                        {t(`items.${offer.number}.title`)}
                      </h3>

                      <p dir={dir} className="mt-1 text-base font-normal leading-normal">
                        {t(`items.${offer.number}.description`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================== */}
      {/* MOBILE */}
      {/* ===================================================== */}

      <div
        ref={mobileSectionRef}
        className="mt-10 lg:hidden"
      >
        {offers.map((offer, index) => {
          const isActive = activeStep === offer.number;

          return (
            <div
              key={offer.number}
              className="relative min-h-[230px]"
            >
              <div
                className="sticky"
                style={{
                  top: `calc(var(--home-nav-height) + ${16 + index * 42}px)`,
                  zIndex: index + 1,
                }}
              >
                {/* Top Line */}
                <motion.div
                  animate={{
                    width: isActive ? "100%" : "80px",
                  }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="h-[2px]"
                  style={{
                    backgroundColor: isActive
                      ? offer.color
                      : "var(--muted)",
                  }}
                />

                {/* Number + Content */}
                <div className="flex min-h-[150px] items-start gap-5 py-5">
                  {/* Number */}
                  <h1
                    className="shrink-0 text-7xl font-normal"
                    style={{
                      color: offer.color,
                    }}
                  >
                    {offer.number}
                  </h1>

                  {/* Content */}
                  <div className="min-w-0 pt-2">
                    <h3 dir={dir} className="text-2xl font-semibold leading-snug">
                      {t(`items.${offer.number}.title`)}
                    </h3>

                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          key={offer.number}
                          dir={dir}
                          initial={{
                            opacity: 0,
                            y: 15,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -15,
                          }}
                          transition={{
                            duration: 0.35,
                            ease: "easeOut",
                          }}
                          className="mt-1 max-w-[280px] text-base font-normal leading-normal"
                        >
                          {t(`items.${offer.number}.description`)}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}