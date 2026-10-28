"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import TeamCard, { type TeamMember } from "./TeamCard";
import { teamMembers } from "@/data/home";

type TeamGroupProps = {
  id?: string;
  members: TeamMember[];
  eyebrow: string;
  title: string;
  description: string;
  reverse?: boolean;
};

function TeamGroup({
  id,
  members,
  eyebrow,
  title,
  description,
  reverse,
}: TeamGroupProps) {
  const dir = useTextDirection();
  const reduce = useReducedMotion();

  // النص يدخل من جهته (ينعكس تلقائياً في RTL)
  const textX = reduce ? 0 : (reverse ? 1 : -1) * (dir === "rtl" ? -1 : 1) * 40;

  const textContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const textItem = {
    hidden: { opacity: 0, x: textX },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const cardsContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const cardItem = {
    hidden: { opacity: 0, y: reduce ? 0 : 40, scale: reduce ? 1 : 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 16 },
    },
  };

  return (
    <div
      id={id}
      className={`flex flex-col gap-10 lg:items-center lg:justify-between lg:gap-12 ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      {/* Text */}
      <motion.div
        dir={dir}
        variants={textContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-md text-start lg:flex-1"
      >
        <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          <motion.span variants={textItem} className="block text-foreground">
            {eyebrow}
          </motion.span>
          <motion.span
            variants={textItem}
            className="inline-block bg-[image:var(--google-gradient)] bg-clip-text pb-1 text-transparent"
          >
            {title}
          </motion.span>
        </h2>

        <motion.p
          variants={textItem}
          className="mt-4 text-lg font-bold leading-snug text-foreground md:text-xl"
        >
          {description}
        </motion.p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={cardsContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`flex flex-wrap justify-center gap-4 sm:gap-5 ${
          reverse ? "lg:justify-start" : "lg:justify-end"
        }`}
      >
        {members.map((member) => (
          <motion.div
            key={member.id}
            variants={cardItem}
            className="w-[calc(50%-0.5rem)] max-w-[200px] sm:w-[190px] lg:w-[200px]"
          >
            <TeamCard member={member} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function LeadershipTeam() {
  const t = useTranslations("home.leadership");

  const leaders = teamMembers.filter((m) => m.type === "leader");
  return (
    <section
      id="leadership"
      className="bg-sponsor-gray px-6 py-16 lg:px-10 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:gap-15">
        <TeamGroup
          members={leaders}
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

      </div>
    </section>
  );
}

export function AdvisorsTeam() {
  const t = useTranslations("home.leadership");
  const advisors = teamMembers.filter((member) => member.type === "advisor");

  return (
    <section id="advisors" className="bg-sponsor-gray px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:gap-15">
        <TeamGroup
          members={advisors}
          eyebrow={t("advisors.eyebrow")}
          title={t("advisors.title")}
          description={t("advisors.description")}
          reverse
        />
      </div>
    </section>
  );
}
