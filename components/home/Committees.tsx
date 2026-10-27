"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import CommitteeCard from "./CommitteeCard";
import CommitteePersonCard from "./CommitteePersonCard";
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
  const dir = useTextDirection();

  return (
    <article
      className="group relative flex h-[550px] w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--committee-card-surface)] p-3 shadow-sm sm:h-[460px] sm:p-4"
      style={{
        borderTopColor: "transparent",
        borderTopWidth: 3,
        "--committee-accent": "var(--gdg-blue)",
      } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-[3px] bg-[image:var(--google-gradient)]" />
      <div className="relative flex min-w-0 flex-none flex-col sm:flex-1">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <h3
            dir={dir}
            className="text-balance break-words bg-[image:var(--google-gradient)] bg-clip-text text-lg font-semibold leading-snug text-transparent sm:text-xl"
          >
            {title}
          </h3>
          <span className="shrink-0 rounded-full bg-[image:var(--google-gradient)] px-2.5 py-1 text-[10px] font-semibold tabular-nums text-white">
            {String(number).padStart(2, "0")}
          </span>
        </div>
        <p
          dir={dir}
          className="relative z-10 mt-2 max-w-full text-start text-sm leading-relaxed text-foreground/75 sm:text-base"
        >
          {description}
        </p>
      </div>
      <div className="mt-3 border-t border-foreground/10 pt-3">
        <div className="flex flex-wrap justify-center gap-3">
          {advisors.map((advisor, index) => (
            <CommitteePersonCard
              key={advisor.name}
              image={advisor.image}
              alt={advisor.name}
              label={advisor.role}
              name={advisor.name}
              dir={dir}
              accentColor="var(--gdg-blue)"
              index={index}
              linkedin={advisor.linkedin}
              x={advisor.x}
              googleAccent
              layoutClass="w-[calc(50%-0.375rem)] min-w-[140px] max-w-[220px]"
            />
          ))}
        </div>
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
            <span className="bg-[image:var(--google-gradient)] bg-clip-text pe-1 italic text-transparent rtl:not-italic">
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
              const isAdvisorsItem = item.key === "advisors";
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
                  className={`relative flex min-h-14 items-center gap-3 rounded-xl border px-3 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${
                    isSelected
                      ? "border-transparent bg-foreground text-background shadow-sm"
                      : "border-foreground/10 bg-[var(--committee-card-surface)] text-foreground hover:border-foreground/25 hover:bg-foreground/5"
                  }`}
                  style={isSelected && !isAdvisorsItem ? { borderInlineStartColor: "#4285F4", borderInlineStartWidth: 4 } : undefined}
                >
                  <span
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums text-white ${isAdvisorsItem ? "bg-[conic-gradient(from_0deg,#4285F4_0deg,#34A853_90deg,#FBBC04_180deg,#EA4335_270deg,#4285F4_360deg)]" : ""}`}
                    style={isAdvisorsItem ? undefined : { backgroundColor: "#4285F4" }}
                  >
                    <span
                      className={isAdvisorsItem ? "relative z-10" : ""}
                      style={isAdvisorsItem ? { textShadow: "0 1px 2px rgb(0 0 0 / 75%)" } : undefined}
                    >
                      {String(item.number).padStart(2, "0")}
                    </span>
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
