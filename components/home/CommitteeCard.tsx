"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useTextDirection } from "@/i18n/useTextDirection";
import CommitteePersonCard from "./CommitteePersonCard";

const darkCommitteeAccent = [
  "[html[data-theme=dark]_&]:bg-[var(--committee-accent)]",
  "[html[data-theme=dark]_&]:text-white",
  "[@media(prefers-color-scheme:dark)]:[html:not([data-theme])_&]:bg-[var(--committee-accent)]",
  "[@media(prefers-color-scheme:dark)]:[html:not([data-theme])_&]:text-white",
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
      label: t("leadLabel"),
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
            label: t("coLeaderLabel"),
          },
        ]
      : []),
  ];

  return (
    <article
      className="group relative flex min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--committee-card-surface)] p-3 shadow-sm transition-shadow duration-200 hover:shadow-md motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:p-4"
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
          className="relative z-10 flex flex-1 flex-col gap-3"
        >
          {/* Start Side */}
          <div className="relative min-w-0 flex-none">
            <div className="relative z-10">
            {/* Committee Name */}
            <div className="text-center">
              <h3
                dir={dir}
                className={`mx-auto flex h-auto w-fit max-w-full items-center justify-center rounded-lg px-1.5 py-1 text-balance break-words text-center text-lg font-semibold leading-snug text-[var(--committee-accent)] sm:text-xl ${darkCommitteeAccent}`}
              >
                {activeName}
              </h3>
            </div>

            {/* Description */}
            <div className="mt-3">
              <p
                dir={dir}
                className="min-h-24 max-w-full text-justify text-sm leading-6 text-foreground/75 sm:text-base sm:leading-6"
                style={{ textAlignLast: "start" }}
              >
                {activeDescription}
              </p>

            </div>
            </div>
          </div>

          {/* End / Bottom Side */}
          <div className="mt-auto border-t border-foreground/10 pt-3">
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
