"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { teamMembers } from "@/data/home";
import { useTextDirection } from "@/i18n/useTextDirection";

const advisors = teamMembers.filter((member) => member.type === "advisor");
// The same social glyphs used by TeamCard; keep the original profile URLs.
const socialIcons = {
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

export default function AdvisorsTeam() {
  const t = useTranslations("home.leadership");
  const dir = useTextDirection();
  const reduce = useReducedMotion();
  const textItem = {
    hidden: { opacity: 0, x: reduce ? 0 : (dir === "rtl" ? 1 : -1) * 40 },
    visible: { opacity: 1, x: 0, transition: { duration: reduce ? 0 : 0.5, ease: "easeOut" as const } },
  };

  return (
    <section id="advisors" dir={dir} aria-labelledby="advisors-title" className="bg-sponsor-gray px-6 py-8">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate={reduce ? "visible" : undefined}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.12 } } }}
        className="pb-10"
      >
        <motion.h2 id="advisors-title" variants={textItem} className="text-3xl leading-snug font-bold text-foreground">
          {t("advisors.eyebrow")}{" "}
          <span className="bg-(image:--google-gradient) bg-clip-text pe-1 italic text-transparent rtl:not-italic">{t("advisors.title")}</span>
        </motion.h2>
        <motion.p variants={textItem} className="mt-4 max-w-4xl text-lg leading-normal text-foreground/60">{t("advisors.description")}</motion.p>
      </motion.div>

      <div className="relative isolate mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:px-4">
        {advisors.map((member, index) => (
          <motion.article
            key={member.id}
            aria-labelledby={`advisor-${member.id}`}
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: reduce ? 0 : 0.2 + index * 0.12, ...(reduce ? { duration: 0 } : {}) }}
            className="relative grid min-h-48 min-w-0 grid-cols-5 sm:min-h-56"
          >
            {/* Angle only the rounded surfaces, leaving portraits and text upright. */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl shadow-md lg:-skew-x-6 lg:rtl:skew-x-6" aria-hidden="true">
              <div className="absolute inset-0 overflow-hidden rounded-3xl border border-border/50 bg-(--committee-card-surface)">
                <span className="absolute inset-0 opacity-70" style={{ backgroundImage: "url('/images/Google-design%20.png')", backgroundSize: "auto 100%" }} />
                <span className="absolute inset-0 bg-background/80" />
              </div>
            </div>

            <div className="relative col-span-2 -mt-4 min-w-0 overflow-hidden rounded-b-3xl">
              <Image src={member.image} fill loading="eager" sizes="(min-width: 1024px) 20vw, 40vw" alt={t(`team.${member.id}.name`)} className="object-contain object-bottom" />
            </div>
            <div className="col-span-3 flex min-w-0 flex-col justify-center py-6 ps-2 pe-4 text-start sm:pe-8">
              <span aria-hidden="true" className="mb-3 h-0.5 w-12 rounded-full bg-(image:--google-gradient)" />
              <h3 id={`advisor-${member.id}`} className="text-xl leading-snug font-semibold break-words text-foreground">{t(`team.${member.id}.name`)}</h3>
              <p className="mt-1 text-sm leading-normal text-foreground">
                <span dir="ltr" className="inline-block">
                  <span className="text-gdg-blue">G</span><span className="text-gdg-red">o</span><span className="text-gdg-yellow">o</span><span className="text-gdg-blue">g</span><span className="text-gdg-green">l</span><span className="text-gdg-red">e</span>{" "}Developer Group
                </span>
              </p>
              <p className="mt-1 text-sm text-foreground/60">{t(`team.${member.id}.role`)}</p>
              <div className="mt-3 flex items-center gap-2">
                {(["linkedin", "x"] as const).map((social) => member[social] && (
                  <motion.a
                    key={social}
                    href={member[social]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t(`team.${member.id}.name`)} - ${t(`social.${social}`)}`}
                    whileHover={reduce ? undefined : { scale: 1.2, rotate: 8 }}
                    whileTap={reduce ? undefined : { scale: 0.9 }}
                    className={`grid size-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${social === "linkedin" ? "bg-linkedin-blue text-white" : "bg-foreground text-background"}`}
                  >
                    <svg viewBox="0 0 24 24" className="size-3 fill-current" aria-hidden="true"><path d={socialIcons[social]} /></svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
