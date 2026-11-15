"use client";

import Image from "next/image";
import communityOne from "@/public/images/about-community-1.png";
import communityTwo from "@/public/images/about-community-2.png";
import communityThree from "@/public/images/about-community-3.png";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { useEffect, useRef, useState } from "react";

const MotionImage = motion.create(Image);
const statTargets = { members: 165, events: 10, projects: 9, communities: 10 } as const;

export default function AboutSection() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("home.about");
  const dir = useTextDirection();
  // Framer Motion x is physical: flip slide-ins so text/images enter from their own side in RTL.
  const sign = dir === "rtl" ? -1 : 1;
  const [counts, setCounts] = useState({
    members: 0,
    events: 0,
    projects: 0,
    communities: 0,
  });

  const statsRef = useRef(null);
  const isInView = useInView(statsRef, {
    once: true,
    amount: 0.3,
  });

  useEffect(() => {
    if (!isInView) return;

    const duration = reduceMotion ? 0 : 1200;
    let frame = 0;
    const startTime = performance.now();

    const animateCounts = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = duration ? Math.min(elapsed / duration, 1) : 1;

      // Smooth ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCounts({
        members: Math.floor(statTargets.members * easedProgress),
        events: Math.floor(statTargets.events * easedProgress),
        projects: Math.floor(statTargets.projects * easedProgress),
        communities: Math.floor(statTargets.communities * easedProgress),
      });

      if (progress < 1) {
        frame = requestAnimationFrame(animateCounts);
      }
    };

    frame = requestAnimationFrame(animateCounts);
    return () => cancelAnimationFrame(frame);
  }, [isInView, reduceMotion]);

  return (
    <section id="about" className="px-6 py-[clamp(1rem,1.5vw,1.75rem)]">
      <div dir="ltr" className="grid w-full min-w-0 grid-cols-1 gap-[clamp(1.5rem,2vw,2.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="w-full min-w-0 text-left">
          <motion.h2
            dir={dir}
            className="text-left text-[clamp(1.75rem,1.5rem_+_0.75vw,3rem)] font-bold leading-snug"
            initial={{ opacity: 0, x: -30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
          >
            {t("title")}
          </motion.h2>

          <motion.p
            dir={dir}
            className="mt-5 whitespace-pre-line text-left text-[clamp(0.9025rem,0.855rem_+_0.3135vw,1.235rem)] font-normal leading-relaxed"
            initial={{ opacity: 0, x: -30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: "easeOut",
            }}
          >
            {t("description")}
          </motion.p>
        </div>

        <div className="relative mx-auto mt-6 h-[clamp(19rem,28vw,35rem)] w-[94%] min-w-0 max-w-full lg:mx-0 lg:mt-0 lg:w-[90%] lg:max-w-[min(42vw,50rem)] lg:justify-self-end">
          <MotionImage
            src={communityOne}
            sizes="(min-width: 1024px) 45vw, 90vw"
            alt={t("imageAlt", { number: 1 })}
            className="absolute top-0 end-0 h-[90px] w-full rounded-xl object-cover lg:h-1/3"
            initial={{ opacity: 0, x: 30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />

          <MotionImage
            src={communityTwo}
            sizes="(min-width: 1024px) 45vw, 90vw"
            alt={t("imageAlt", { number: 2 })}
            className="absolute top-[100px] end-0 h-[150px] w-full rounded-xl object-cover lg:top-[calc(33.333%+clamp(0.625rem,1.2vw,1.25rem))] lg:h-[clamp(9rem,11vw,15rem)]"
            initial={{ opacity: 0, x: 30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: 0.12,
              ease: "easeOut",
            }}
          />

          <MotionImage
            src={communityThree}
            sizes="(min-width: 1024px) 168px, 36vw"
            alt={t("imageAlt", { number: 3 })}
            className="absolute bottom-[clamp(2rem,5vw,3rem)] start-[-10px] top-auto h-[clamp(7rem,24vw,8rem)] w-[40%] rounded-xl border-t-10 border-e-10 border-background object-cover lg:start-0 lg:h-[clamp(9rem,10vw,10.5rem)] lg:w-[clamp(7.5rem,10vw,10.5rem)] xl:start-[-24px]"            initial={{ opacity: 0, x: -30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: 0.24,
              ease: "easeOut",
            }}
          />
        </div>
      </div>

      <div
        ref={statsRef}
        className="mt-10 grid grid-cols-2 gap-4 text-center lg:grid-cols-4"
      >
        <div>
          <h3 className="text-2xl font-bold text-gdg-red lg:text-4xl">            +{counts.members}
          </h3>
          <p dir={dir} className="mt-1 text-lg font-medium leading-normal">{t("stats.members")}</p>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gdg-yellow lg:text-4xl">            +{counts.events}
          </h3>
          <p dir={dir} className="mt-1 text-lg font-medium leading-normal">{t("stats.events")}</p>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gdg-blue lg:text-4xl">
            +{counts.projects}
          </h3>
          <p dir={dir} className="mt-1 text-lg font-medium leading-normal">{t("stats.projects")}</p>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gdg-green lg:text-4xl">
            {counts.communities}
          </h3>
          <p dir={dir} className="mt-1 text-lg font-medium leading-normal">{t("stats.communities")}</p>
        </div>
      </div>
    </section>
  );
}
