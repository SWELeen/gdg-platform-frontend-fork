"use client";

import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { useEffect, useRef, useState } from "react";

export default function AboutSection() {
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

  const statTargets = {
    members: 165,
    events: 10,
    projects: 9,
    communities: 10,
  } as const;

  const statsRef = useRef(null);
  const isInView = useInView(statsRef, {
    once: true,
    amount: 0.3,
  });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1200;
    const startTime = performance.now();

    const animateCounts = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCounts({
        members: Math.floor(statTargets.members * easedProgress),
        events: Math.floor(statTargets.events * easedProgress),
        projects: Math.floor(statTargets.projects * easedProgress),
        communities: Math.floor(statTargets.communities * easedProgress),
      });

      if (progress < 1) {
        requestAnimationFrame(animateCounts);
      }
    };

    requestAnimationFrame(animateCounts);
  }, [isInView]);

  return (
    <section id="about" className="p-8 lg:p-10">
      <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-5">
        <div className="max-w-xl">
          <motion.h2
            dir={dir}
            className="text-3xl font-bold leading-snug"
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
            className="mt-6 whitespace-pre-line text-justify text-lg font-normal leading-normal"
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

        <div className="relative mt-6 h-[360px] w-full lg:mt-0 lg:h-[400px]">
          <motion.img
            src="/images/about-community-1.png"
            alt={t("imageAlt", { number: 1 })}
            className="absolute top-0 end-0 h-[100px] w-full rounded-xl object-cover lg:h-1/3"
            initial={{ opacity: 0, x: 30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />

          <motion.img
            src="/images/about-community-2.png"
            alt={t("imageAlt", { number: 2 })}
            className="absolute top-[110px] end-0 h-[170px] w-full rounded-xl object-cover lg:top-[140px] lg:h-[200px]"
            initial={{ opacity: 0, x: 30 * sign }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: 0.12,
              ease: "easeOut",
            }}
          />

          <motion.img
            src="/images/about-community-3.png"
            alt={t("imageAlt", { number: 3 })}
            className="absolute start-[-10px] top-[190px] h-[130px] w-[42%] rounded-xl border-t-10 border-e-10 border-background object-cover lg:start-0 lg:top-[200px] lg:h-[170px] lg:w-[160px] xl:start-[-30px]"            initial={{ opacity: 0, x: -30 * sign }}
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
