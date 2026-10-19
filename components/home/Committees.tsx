"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import CommitteeCard from "./CommitteeCard";
import { committees, teamMembers } from "@/data/home";
import { useTextDirection } from "@/i18n/useTextDirection";

const advisors = teamMembers.filter((member) => member.type === "advisor");
const directoryItems = [
  ...committees.map((committee, index) => ({
    key: committee.id,
    number: index + 1,
    committee,
  })),
  {
    key: "advisors",
    number: committees.length + 1,
    advisors,
  },
];

type AdvisorProfile = {
  image: string;
  name: string;
  role: string;
  linkedin: string;
  x: string;
  imagePositionClass?: string;
};

type AdvisorCardProps = {
  title: string;
  advisors: AdvisorProfile[];
  description: string;
  number: number;
};

function AdvisorCard({ title, advisors, description, number }: AdvisorCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <article
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--committee-card-surface)] p-4 shadow-sm sm:p-5"
      style={{
        borderTopColor: "var(--gdg-blue)",
        borderTopWidth: 3,
        borderInlineStartColor: "var(--gdg-blue)",
        borderInlineStartWidth: 3,
      }}
    >
      <div className="relative">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <h3 className="text-2xl font-semibold leading-snug text-gdg-blue sm:text-3xl">{title}</h3>
          <span className="shrink-0 rounded-full bg-gdg-blue/10 px-3 py-1 text-xs font-semibold tabular-nums text-gdg-blue">
            {String(number).padStart(2, "0")}
          </span>
        </div>
        <p className="relative z-10 mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65 sm:text-base">
          {description}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {advisors.map((advisor, index) => (
          <motion.article
            key={advisor.name}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.08, ease: "easeOut" }}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            className="group relative mt-2 flex h-full min-h-[245px] w-full max-w-[220px] flex-col overflow-visible rounded-2xl border border-foreground/10 bg-background p-2.5 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg sm:min-h-[265px] sm:p-3"
          >
            <span aria-hidden="true" className="absolute -top-2 start-4 h-2 w-16 rounded-t-md bg-gdg-blue" />
            <div className="mx-auto h-24 w-full max-w-24 overflow-hidden rounded-xl bg-surface-muted sm:h-28 sm:max-w-28">
              <img
                src={advisor.image}
                alt={advisor.name}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-contain object-bottom motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03] ${advisor.imagePositionClass ?? ""}`}
              />
            </div>
            <div className="relative mt-2 flex flex-1 flex-col items-center overflow-hidden rounded-t-2xl rounded-b-xl border border-foreground/10 bg-foreground/[0.03] px-2.5 pb-1.5 pt-3">
              <img src="/images/Google-design%20.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-background/65" />
              <span aria-hidden="true" className="absolute inset-x-4 top-0 z-10 h-0.5 rounded-full bg-gdg-blue/40" />
              <div className="relative z-10 mx-auto w-fit max-w-full px-2 py-1.5">
                <p className="text-xs font-semibold text-gdg-blue">{advisor.role}</p>
                <p className="mt-1 text-sm font-bold text-foreground sm:text-base">{advisor.name}</p>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-center gap-2 pt-2">
                <a
                  href={advisor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${advisor.name} on LinkedIn`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-linkedin-blue text-white transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" />
                  </svg>
                </a>
                <a
                  href={advisor.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${advisor.name} on X`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </article>
  );
}

export default function Committees() {
  const t = useTranslations("home.committees");
  const leadershipT = useTranslations("home.leadership");
  const dir = useTextDirection();
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(directoryItems[0]?.key ?? "");
  const [selectedSubCommitteeId, setSelectedSubCommitteeId] = useState<string>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const selectedItem =
    directoryItems.find((item) => item.key === selectedId) ?? directoryItems[0];

  return (
    <section
      id="committees"
      className="bg-background px-6 py-12 sm:px-4 sm:py-12 lg:px-10 lg:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl pb-8 sm:pb-10">
          <h2 className="text-4xl font-bold leading-snug text-foreground md:text-5xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-gdg-blue to-gdg-red bg-clip-text pe-1 italic text-transparent rtl:not-italic">
              {t("highlight")}
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/60 md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div
          dir={dir}
          className="grid items-start gap-5 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-7"
        >
          <nav
            aria-label={t("title")}
            className="grid grid-cols-1 gap-2 lg:sticky lg:top-24 lg:max-h-[min(75vh,680px)] lg:overflow-y-auto lg:pe-2"
          >
            {directoryItems.map((item) => {
              if ("committee" in item) {
                const committee = item.committee;
                const subCommittees = "subCommittees" in committee
                  ? committee.subCommittees
                  : undefined;
                const isSelected = item.key === selectedId;
                const hasSubCommittees = Boolean(subCommittees?.length);
                const badgeTextColor = committee.id === "content-writing" ? "#171717" : "#ffffff";
                const buttonClass = `flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${
                  isSelected
                    ? "border-transparent bg-foreground text-background shadow-sm"
                    : "border-foreground/10 bg-[var(--committee-card-surface)] text-foreground hover:border-foreground/25 hover:bg-foreground/5"
                }`;
                const selectedStyle = isSelected
                  ? {
                      outlineColor: committee.color,
                      borderInlineStartColor: committee.color,
                      borderInlineStartWidth: 4,
                    }
                  : undefined;

                return (
                  <div key={item.key}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-expanded={hasSubCommittees ? expandedId === item.key : undefined}
                      onClick={() => {
                        setSelectedId(item.key);
                        setSelectedSubCommitteeId(undefined);
                        setExpandedId((current) =>
                          hasSubCommittees && current !== item.key ? item.key : null,
                        );
                      }}
                      className={buttonClass}
                      style={selectedStyle}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                        style={{
                          color: badgeTextColor,
                          backgroundColor: committee.color,
                        }}
                      >
                        {String(item.number).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium leading-snug sm:text-base">
                        {t(`items.${committee.id}.name`)}
                      </span>
                      {hasSubCommittees && (
                        <ChevronDown
                          aria-hidden="true"
                          className={`ms-auto h-4 w-4 shrink-0 transition-transform ${
                            expandedId === item.key ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {expandedId === item.key && subCommittees && (
                      <div className="mt-1 space-y-1 border-s border-foreground/10 py-1 ps-3 ms-4">
                        {subCommittees.map((subCommittee) => {
                          const isSubSelected = selectedSubCommitteeId === subCommittee.id;

                          return (
                            <button
                              key={subCommittee.id}
                              type="button"
                              aria-pressed={isSubSelected}
                              onClick={() => {
                                setSelectedId(item.key);
                                setSelectedSubCommitteeId(subCommittee.id);
                              }}
                              className={`flex min-h-10 w-full items-center rounded-lg px-3 py-2 text-start text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                isSubSelected
                                  ? "bg-foreground/10 font-semibold text-foreground"
                                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                              }`}
                              style={isSubSelected ? { borderInlineStart: `3px solid ${subCommittee.color}` } : undefined}
                            >
                              <span
                                aria-hidden="true"
                                className="me-2 h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: subCommittee.color }}
                              />
                              {t(
                                `items.${committee.id}.subCommittees.${subCommittee.id}.name`,
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isSelected = item.key === selectedId;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedId(item.key);
                    setSelectedSubCommitteeId(undefined);
                    setExpandedId(null);
                  }}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${
                    isSelected
                      ? "border-transparent bg-foreground text-background shadow-sm"
                      : "border-foreground/10 bg-[var(--committee-card-surface)] text-foreground hover:border-foreground/25 hover:bg-foreground/5"
                  }`}
                  style={isSelected ? { borderInlineStartColor: "#4285F4", borderInlineStartWidth: 4 } : undefined}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums text-white"
                    style={{ backgroundColor: "#4285F4" }}
                  >
                    {String(item.number).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium leading-snug sm:text-base">
                    {t("advisorsLabel")}
                  </span>
                </button>
              );
            })}
          </nav>

          <AnimatePresence mode="wait" initial={false}>
            {selectedItem && (
              <motion.div
                key={selectedItem.key}
                initial={reduceMotion ? false : { opacity: 0, x: dir === "rtl" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.35, ease: "easeInOut" }}
                className="min-w-0"
              >
                {"committee" in selectedItem ? (
                  <CommitteeCard
                    committee={selectedItem.committee}
                    number={selectedItem.number}
                    initialSubCommitteeId={selectedSubCommitteeId}
                  />
                ) : (
                  <AdvisorCard
                    title={t("advisorsLabel")}
                    advisors={selectedItem.advisors.map((advisor) => ({
                      image: advisor.image,
                      name: leadershipT(`team.${advisor.id}.name`),
                      role: leadershipT(`team.${advisor.id}.role`),
                linkedin: advisor.linkedin,
                x: advisor.x,
                imagePositionClass: advisor.imagePositionClass,
                    }))}
                    description={leadershipT("advisors.description")}
                    number={selectedItem.number}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
