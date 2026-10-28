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
  linkedin?: string;
  x?: string;
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
  initialSubCommitteeId?: string;
};

/* ---------- Card ---------- */

export default function CommitteeCard({
  committee,
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
      linkedin: activeCommittee.lead.linkedin,
      x: activeCommittee.lead.x,
      name: activeLeadName,
      label: t.has(basePath + ".leadLabel") ? t(basePath + ".leadLabel", { name: activeName }) : t("leadLabel", { name: activeName }),
    },
    ...(activeCommittee.coLeader && activeCoLeaderName
      ? [
          {
            key: "co-lead",
            image: activeCommittee.coLeader.image,
            imageScaleClass: activeCommittee.coLeader.imageScaleClass,
            imagePositionClass: activeCommittee.coLeader.imagePositionClass,
            linkedin: activeCommittee.coLeader.linkedin,
            x: activeCommittee.coLeader.x,
            name: activeCoLeaderName,
            label: t.has(basePath + ".coLeaderLabel") ? t(basePath + ".coLeaderLabel", { name: activeName }) : t("coLeaderLabel", { name: activeName }),
          },
        ]
      : []),
  ];

  return (
    <article
      className="group relative flex h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--committee-card-surface)] p-3 shadow-sm transition-shadow duration-200 hover:shadow-md motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:p-4"
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
          className="relative z-10 flex h-full min-h-0 flex-col gap-3"
        >
          {/* Start Side */}
          <div className="relative h-[150px] min-h-0 min-w-0 flex-none overflow-hidden">
            <div className="relative z-10">
            {/* Committee Name */}
            <div className="text-center">
              <h3
                dir={dir}
                className={`mx-auto text-balance break-words text-center text-lg font-semibold leading-snug text-[var(--committee-accent)] sm:text-xl ${useDarkAccent ? `w-fit max-w-full rounded-lg px-3 py-2 ${darkDeveloperAccent}` : ""}`}
              >
                {activeName}
              </h3>
            </div>

            {/* Description */}
            <div className="mt-2">
              <p
                dir={dir}
                className="line-clamp-4 max-w-full text-start text-sm leading-relaxed text-foreground/75 sm:text-base"
              >
                {activeDescription}
              </p>

            </div>
            </div>
          </div>

          {/* End / Bottom Side */}
          <div className="mt-3 border-t border-foreground/10 pt-3">
            <div className="grid w-full grid-cols-2 items-stretch justify-items-center gap-3">
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
                  linkedin={leader.linkedin}
                  x={leader.x}
                  imageScaleClass={leader.imageScaleClass}
                  imagePositionClass={leader.imagePositionClass}
                  layoutClass={leaders.length === 1 ? "col-span-2 w-[calc(50%-0.375rem)]" : "w-full"}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </article>
  );
}
