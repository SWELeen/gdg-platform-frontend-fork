"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useTextDirection } from "@/i18n/useTextDirection";
import CommitteePersonCard from "./CommitteePersonCard";

const darkDeveloperAccent = [
  "[html[data-theme=dark]_&]:bg-[var(--committee-accent)]",
  "[html[data-theme=dark]_&]:text-white",
  "dark:[html:not([data-theme])_&]:bg-[var(--committee-accent)]",
  "dark:[html:not([data-theme])_&]:text-white",
].join(" ");

type Person = {
  name: string;
  image: string;
  imageScaleClass?: string;
  imagePositionClass?: string;
};

type SubCommittee = {
  id: string;
  name: string;
  color: string;
  description: string;
  lead: Person;
  coLeader?: Person;
};

type Committee = {
  id: string;
  name: string;
  color: string;
  description: string;
  lead: Person;
  coLeader?: Person;
  subCommittees?: SubCommittee[];
};

type CommitteeCardProps = {
  committee: Committee;
  number: number;
  initialSubCommitteeId?: string;
};

/* ---------- Card ---------- */

export default function CommitteeCard({
  committee,
  number,
  initialSubCommitteeId,
}: CommitteeCardProps) {
  const t = useTranslations("home.committees");
  const dir = useTextDirection();
  const reduceMotion = useReducedMotion();

  // Framer Motion x is physical: flip the switch animation in RTL.
  const sign = dir === "rtl" ? -1 : 1;
  const offset = reduceMotion ? 0 : 20 * sign;

  const activeSubCommittee = committee.subCommittees?.find(
    (subCommittee) => subCommittee.id === initialSubCommitteeId,
  );
  const activeCommittee = activeSubCommittee ?? committee;
  const isSubCommittee = Boolean(activeSubCommittee);
  const useDarkAccent = committee.id === "developers";

  // Sub-committees are nested under their parent committee's translation entry.
  const basePath = isSubCommittee
    ? `items.${committee.id}.subCommittees.${activeCommittee.id}`
    : `items.${committee.id}`;

  const activeName = t(`${basePath}.name`);
  const activeDescription = t(`${basePath}.description`);
  const activeLeadName = t(`${basePath}.leadName`);

  const activeCoLeaderName = activeCommittee.coLeader
    ? t(`items.${committee.id}.coLeaderName`)
    : null;
  const leaders = [
    {
      key: "lead",
      image: activeCommittee.lead.image,
      imageScaleClass: activeCommittee.lead.imageScaleClass,
      imagePositionClass: activeCommittee.lead.imagePositionClass,
      name: activeLeadName,
      label: t("leadLabel", { name: activeName }),
    },
    ...(activeCommittee.coLeader && activeCoLeaderName
      ? [
          {
            key: "co-lead",
            image: activeCommittee.coLeader.image,
            imageScaleClass: activeCommittee.coLeader.imageScaleClass,
            imagePositionClass: activeCommittee.coLeader.imagePositionClass,
            name: activeCoLeaderName,
            label: t("coLeaderLabel", { name: activeName }),
          },
        ]
      : []),
  ];

  return (
    <article
      className="group relative flex h-[550px] w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--committee-card-surface)] p-3 shadow-sm transition-shadow duration-200 hover:shadow-md motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:h-[460px] sm:p-4"
      style={{
        borderTopColor: activeCommittee.color,
        borderTopWidth: 3,
        "--committee-accent": activeCommittee.color,
      } as CSSProperties}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCommittee.id}
          initial={{ opacity: 0, x: offset }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -offset }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.35,
            ease: "easeInOut",
          }}
          className="relative z-10 flex h-full flex-col gap-3"
        >
          {/* Start Side */}
          <div className="relative min-w-0 flex-1">
            <div className="relative z-10">
            {/* Committee Name */}
            <div className="flex items-start justify-between gap-3">
              <h3
                dir={dir}
                className={`text-balance break-words text-lg font-semibold leading-snug text-[var(--committee-accent)] sm:text-xl ${useDarkAccent ? `w-fit max-w-full rounded-lg px-3 py-2 ${darkDeveloperAccent}` : ""}`}
              >
                {activeName}
              </h3>
              <span
                aria-hidden="true"
                className={`shrink-0 rounded-full bg-[color-mix(in_srgb,var(--committee-accent)_12%,transparent)] px-2.5 py-1 text-[10px] font-semibold tabular-nums text-[var(--committee-accent)] ${useDarkAccent ? darkDeveloperAccent : ""}`}
              >
                {String(number).padStart(2, "0")}
              </span>
            </div>

            {/* Description */}
            <div className="mt-2">
              <p
                dir={dir}
                className="max-w-full text-start text-sm leading-relaxed text-foreground/75 sm:text-base"
              >
                {activeDescription}
              </p>

            </div>
            </div>
          </div>

          {/* End / Bottom Side */}
          <div className="mt-3 border-t border-foreground/10 pt-3">
            <div className="flex w-full flex-wrap justify-center gap-3">
              {leaders.map((leader, index) => (
                <CommitteePersonCard
                  key={`${activeCommittee.id}-${leader.key}`}
                  image={leader.image}
                  alt={leader.name}
                  label={leader.label}
                  name={leader.name}
                  dir={dir}
                  accentColor={activeCommittee.color}
                  index={index}
                  darkAccent={useDarkAccent}
                  linkedin="#"
                  x="#"
                  imageScaleClass={leader.imageScaleClass}
                  imagePositionClass={leader.imagePositionClass}
                  layoutClass={
                    leaders.length === 1
                      ? "w-full max-w-[220px]"
                      : "w-[calc(50%-0.375rem)] min-w-[140px] max-w-[220px]"
                  }
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </article>
  );
}
