"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import CommitteePersonCard from "./CommitteePersonCard";

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

export type Committee = {
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
  const offset = reduceMotion ? 0 : 5 * sign;

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
  const leadLabelKey = `${basePath}.leadLabel`;
  const coLeaderLabelKey = `${basePath}.coLeaderLabel`;

  const activeCoLeaderName = activeCommittee.coLeader
    ? t(`${basePath}.coLeaderName`)
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
      label: t.has(leadLabelKey)
        ? t(leadLabelKey)
        : t("leadLabel"),
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
            label: t.has(coLeaderLabelKey)
              ? t(coLeaderLabelKey)
              : t("coLeaderLabel"),
          },
        ]
      : []),
  ];

  return (
    <article
      className="relative flex w-full flex-col overflow-hidden text-white"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCommittee.id}
          initial={{ opacity: 0, x: `calc(var(--spacing) * ${offset})` }}
          animate={{ opacity: 1, x: "calc(var(--spacing) * 0)" }}
          exit={{ opacity: 0, x: `calc(var(--spacing) * ${-offset})` }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            delay: reduceMotion ? 0 : 0.22,
            ease: [0.22, 0.68, 0, 1],
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
                className="m-0 flex h-auto w-fit max-w-full items-center justify-start p-0 text-start text-2xl leading-snug font-semibold text-balance break-words text-white"
              >
                {activeName}
              </h3>
            </div>

            {/* Description */}
            <div className="mt-3">
              <p
                dir={dir}
                className="max-w-full text-start text-base leading-normal font-normal text-white/70"
                style={{ textAlignLast: "start" }}
              >
                {activeDescription}
              </p>

            </div>
            </div>
          </div>

          {/* End / Bottom Side */}
          <div className="mt-4 border-t border-white/20 pt-3">
            <div dir={leaders.length > 1 ? "ltr" : dir} className="grid w-full grid-cols-1 items-stretch justify-items-center gap-3 sm:grid-cols-2">
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
                  layoutClass={leaders.length === 1
                    ? "w-full sm:col-span-2 sm:max-w-1/2"
                    : leader.key === "lead"
                      ? "w-full sm:col-start-2 sm:row-start-1"
                      : "w-full sm:col-start-1 sm:row-start-1"}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </article>
  );
}
