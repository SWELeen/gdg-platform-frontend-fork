"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useTextDirection } from "@/i18n/useTextDirection";

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

/* ---------- Leader photo + labels (shared by lead & co-lead) ---------- */

type LeaderProps = {
  image: string;
  alt: string;
  label: string;
  name: string;
  dir: "rtl" | "ltr";
  layoutClass: string;
  accentColor: string;
  index: number;
  reduceMotion: boolean;
  darkAccent: boolean;
  imageScaleClass?: string;
  imagePositionClass?: string;
};

const DEFAULT_MEMBER_IMAGE = "/images/unknown.png";
const darkDeveloperAccent = [
  "[html[data-theme=dark]_&]:bg-[var(--committee-accent)]",
  "[html[data-theme=dark]_&]:text-white",
  "dark:[html:not([data-theme])_&]:bg-[var(--committee-accent)]",
  "dark:[html:not([data-theme])_&]:text-white",
].join(" ");
const darkDeveloperText = [
  "[html[data-theme=dark]_&]:text-white",
  "dark:[html:not([data-theme])_&]:text-white",
].join(" ");

function Leader({
  image,
  alt,
  label,
  name,
  dir,
  layoutClass,
  accentColor,
  index,
  reduceMotion,
  darkAccent,
  imageScaleClass,
  imagePositionClass,
}: LeaderProps) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.08, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={`group relative mt-2 flex h-full min-h-[245px] min-w-0 flex-col overflow-visible rounded-2xl border border-foreground/10 bg-background p-2.5 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg sm:min-h-[265px] sm:p-3 ${layoutClass}`}
      style={{ "--committee-accent": accentColor } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute -top-2 start-4 z-10 h-2 w-16 rounded-t-md" style={{ backgroundColor: accentColor }} />
      <div className="mx-auto h-24 w-full max-w-24 overflow-hidden rounded-xl bg-surface-muted sm:h-28 sm:max-w-28">
        <img
          src={image?.trim() ? image : DEFAULT_MEMBER_IMAGE}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`h-full w-full ${imagePositionClass ?? "translate-y-3"} ${imageScaleClass ?? "scale-110"} object-contain object-bottom motion-safe:transition-transform motion-safe:duration-300 ${imageScaleClass ? "motion-safe:group-hover:scale-[1.3]" : "motion-safe:group-hover:scale-[1.15]"}`}
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(DEFAULT_MEMBER_IMAGE)) {
              event.currentTarget.src = DEFAULT_MEMBER_IMAGE;
            }
          }}
        />
      </div>
      <div dir={dir} className="relative mt-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl rounded-b-xl border border-foreground/10 bg-foreground/[0.03] px-2.5 pb-1.5 pt-3">
        <img src="/images/Google-design%20.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-background/65" />
        <span aria-hidden="true" className="absolute inset-x-4 top-0 z-10 h-0.5 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 35%, transparent)` }} />
        <div className="relative z-10 mx-auto w-fit max-w-full px-2 py-1.5">
          <p
            className={`text-xs font-semibold leading-tight text-[var(--committee-accent)] sm:text-sm ${darkAccent ? darkDeveloperText : ""}`}
          >
            {label}
          </p>
          <h4 className="mt-1 break-words text-sm font-bold text-foreground sm:text-base">{name}</h4>
        </div>
        <div className="relative z-10 mt-auto flex items-center justify-center gap-2 pt-2">
          <a
            href="#"
            aria-label={`${name} on LinkedIn`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-linkedin-blue text-white transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" />
            </svg>
          </a>
          <a
            href="#"
            aria-label={`${name} on X`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </motion.article>
  );
}

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
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--committee-card-surface)] p-3 shadow-sm transition-shadow duration-200 hover:shadow-md motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:p-4"
      style={{
        borderTopColor: activeCommittee.color,
        borderTopWidth: 3,
        "--committee-accent": activeCommittee.color,
      } as CSSProperties}
    >
      <AnimatePresence mode="wait" initial={false}>
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
                <Leader
                  key={leader.key}
                  image={leader.image}
                  alt={leader.name}
                  label={leader.label}
                  name={leader.name}
                  dir={dir}
                  accentColor={activeCommittee.color}
                  index={index}
                  reduceMotion={Boolean(reduceMotion)}
                  darkAccent={useDarkAccent}
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
