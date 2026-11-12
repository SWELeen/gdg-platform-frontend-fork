"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import CommitteeCard from "./CommitteeCard";
import { committees } from "@/data/home";
import { useTextDirection } from "@/i18n/useTextDirection";

const directoryItems = committees.map((committee) => ({
  key: committee.id,
  committee,
}));

const developerDirectoryItems = directoryItems.filter(
  (item) => "committee" in item && item.committee.id === "developers",
);
const mainDirectoryItems = directoryItems.filter(
  (item) => !("committee" in item && item.committee.id === "developers"),
);

type DeveloperSubCommittee = {
  id: string;
  color: string;
};

export default function Committees() {
  const t = useTranslations("home.committees");
  const dir = useTextDirection();
  const reduceMotion = useReducedMotion();
  const [selectedMainId, setSelectedMainId] = useState("");
  const [selectedDeveloperSubCommitteeId, setSelectedDeveloperSubCommitteeId] = useState<string>();
  const selectedMainItem = mainDirectoryItems.find((item) => item.key === selectedMainId);
  const developersItem = developerDirectoryItems.find((item) => "committee" in item);
  const developersCommittee =
    developersItem && "committee" in developersItem ? developersItem.committee : undefined;
  const developerSubCommittees: DeveloperSubCommittee[] =
    developersCommittee && "subCommittees" in developersCommittee
      ? (developersCommittee as { subCommittees: DeveloperSubCommittee[] }).subCommittees
      : [];
  const hasOpenDetails = Boolean(selectedMainItem || selectedDeveloperSubCommitteeId);
  const firstDeveloperSubCommitteeId = developerSubCommittees[0]?.id;

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const openDefaultsOnDesktop = () => {
      if (!desktopQuery.matches) {
        setSelectedMainId("");
        setSelectedDeveloperSubCommitteeId(undefined);
        return;
      }

      setSelectedMainId((current) => current || mainDirectoryItems[0]?.key || "");
      setSelectedDeveloperSubCommitteeId(
        (current) => current ?? firstDeveloperSubCommitteeId,
      );
    };

    openDefaultsOnDesktop();
    desktopQuery.addEventListener("change", openDefaultsOnDesktop);
    return () => desktopQuery.removeEventListener("change", openDefaultsOnDesktop);
  }, [firstDeveloperSubCommitteeId]);

  return (
    <section
      id="committees"
      className="bg-background px-6 py-[clamp(1.25rem,2vw,2rem)]"
    >
      <div className="w-full">
        <div className="pb-8 sm:pb-10">
          <h2 className="text-left text-[clamp(1.75rem,1.5rem_+_0.75vw,3rem)] font-bold leading-snug text-foreground">
            {t("title")}{" "}
            <span className="bg-[image:var(--google-gradient)] bg-clip-text pe-1 italic text-transparent rtl:not-italic">
              {t("highlight")}
            </span>
          </h2>

          <p className="mt-4 max-w-[min(56rem,75%)] text-[clamp(0.9025rem,0.855rem_+_0.3135vw,1.235rem)] leading-relaxed text-foreground/60 max-sm:max-w-full">
            {t("subtitle")}
          </p>
        </div>

        <div
          dir="ltr"
          className={`grid w-full items-start gap-y-12 xl:grid-cols-2 xl:gap-y-0 ${hasOpenDetails ? "xl:gap-x-[clamp(2rem,4vw,5rem)]" : "xl:gap-x-[clamp(1rem,3vw,4rem)]"}`}
        >
          <section aria-label={t("developerCommitteesLabel")} dir={dir} className="mx-auto w-full md:max-w-[460px] order-2 xl:mx-0 xl:max-w-none xl:order-1">
            <h3
              dir="ltr"
              style={selectedDeveloperSubCommitteeId ? { marginLeft: 196, marginRight: 0, width: "calc(100% - 196px)" } : undefined}
              className={`mb-4 h-10 w-full items-center justify-center gap-3 whitespace-nowrap text-lg font-semibold text-foreground ${selectedDeveloperSubCommitteeId ? "hidden xl:flex xl:max-w-none" : "mx-auto flex max-w-[380px]"}`}
            >
              <span className="inline-flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm text-white">2</span>
                <span dir={dir}>{t("developerCommitteesLabel")}</span>
              </span>
            </h3>
            {selectedDeveloperSubCommitteeId && (
              <h3 dir="ltr" className="mx-auto mb-4 flex h-10 w-full max-w-[380px] items-center justify-center gap-3 whitespace-nowrap text-lg font-semibold text-foreground xl:hidden">
                <span className="inline-flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm text-white">2</span>
                  <span dir={dir}>{t("developerCommitteesLabel")}</span>
                </span>
              </h3>
            )}
            <div
              dir="ltr"
              className={selectedDeveloperSubCommitteeId ? "xl:grid xl:grid-cols-[minmax(150px,180px)_minmax(0,1fr)] xl:items-start xl:gap-4" : ""}
            >
              <nav
                aria-label={t("developerCommitteesLabel")}
                dir={dir}
                className={`mx-auto min-w-0 space-y-2 ${selectedDeveloperSubCommitteeId ? "w-full" : "max-w-[380px]"}`}
              >
                {developerSubCommittees.map((subCommittee) => {
                  const isSelected = selectedDeveloperSubCommitteeId === subCommittee.id;
                  return (
                    <div key={subCommittee.id} className="space-y-2">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedDeveloperSubCommitteeId((current) => current === subCommittee.id && window.matchMedia("(max-width: 1279px)").matches ? undefined : subCommittee.id)}
                        className={`flex h-12 min-h-12 w-full items-center justify-center overflow-hidden rounded-xl border px-3 py-2 text-center text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${isSelected ? "border-transparent bg-foreground text-background shadow-sm" : "border-foreground/10 text-foreground hover:border-foreground/25 hover:bg-foreground/5"}`}
                        style={{
                          borderColor: subCommittee.color,
                          borderInlineStartWidth: 4,
                          borderInlineStartColor: subCommittee.color,
                        }}
                      >
                        <span className="w-full min-w-0 truncate whitespace-nowrap text-center text-sm font-medium leading-snug sm:text-base" title={t(`items.${developersCommittee?.id}.subCommittees.${subCommittee.id}.name`)}>
                          {t(`items.${developersCommittee?.id}.subCommittees.${subCommittee.id}.name`)}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isSelected && developersCommittee && (
                          <motion.div
                            key={`mobile-${subCommittee.id}`}
                            initial={false}
                            animate={{ opacity: 1 }}
                            exit={reduceMotion ? undefined : { opacity: 0 }}
                            transition={{ opacity: { duration: reduceMotion ? 0.01 : 0.2, ease: "easeOut" } }}
                            className="mx-auto w-full min-w-0 sm:max-w-2xl xl:hidden"
                          >
                            <CommitteeCard committee={developersCommittee} initialSubCommitteeId={subCommittee.id} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
              <AnimatePresence mode="wait" initial={false}>
                {selectedDeveloperSubCommitteeId && developersCommittee && (
                    <motion.div
                      key={selectedDeveloperSubCommitteeId}
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={{ opacity: { duration: reduceMotion ? 0.01 : 0.2, ease: "easeOut" } }}
                      className="hidden min-w-0 xl:block"
                    >
                      <CommitteeCard committee={developersCommittee} initialSubCommitteeId={selectedDeveloperSubCommitteeId} />
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section aria-label={t("mainCommitteesLabel")} dir={dir} className="mx-auto w-full md:max-w-[460px] order-1 xl:mx-0 xl:max-w-none xl:order-2">
            <h3
              dir="ltr"
              style={selectedMainItem ? { marginLeft: 0, marginRight: 196, width: "calc(100% - 196px)" } : undefined}
              className={`mb-4 mx-auto h-10 w-full items-center justify-center gap-3 whitespace-nowrap text-lg font-semibold text-foreground ${selectedMainItem ? "hidden xl:flex xl:max-w-none" : "flex max-w-[380px]"}`}
            >
              <span className="inline-flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--committee-step-gradient)] text-sm text-white">1</span>
                <span dir={dir}>{t("mainCommitteesLabel")}</span>
              </span>
            </h3>
            {selectedMainItem && (
              <h3 dir="ltr" className="mx-auto mb-4 flex h-10 w-full max-w-[380px] items-center justify-center gap-3 whitespace-nowrap text-lg font-semibold text-foreground xl:hidden">
                <span className="inline-flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--committee-step-gradient)] text-sm text-white">1</span>
                  <span dir={dir}>{t("mainCommitteesLabel")}</span>
                </span>
              </h3>
            )}
            <div
              dir="ltr"
              className={selectedMainItem ? "xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(150px,180px)] xl:items-start xl:gap-4" : "flex justify-center xl:justify-end"}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {selectedMainItem && (
                    <motion.div
                      key={selectedMainItem.key}
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={{ opacity: { duration: reduceMotion ? 0.01 : 0.2, ease: "easeOut" } }}
                      className="hidden min-w-0 xl:block"
                    >
                      <CommitteeCard committee={selectedMainItem.committee} />
                    </motion.div>
                  )}
                </AnimatePresence>
              <nav
                aria-label={t("mainCommitteesLabel")}
                dir={dir}
                className={`mx-auto space-y-2 xl:mx-0 ${selectedMainItem ? "xl:w-full xl:min-w-0" : "w-full max-w-[380px]"}`}
              >
                {mainDirectoryItems.map((item) => {
                  const isSelected = item.key === selectedMainId;
                  const committee = item.committee;
                  const accent = committee.color;

                  return (
                    <div key={item.key} className="space-y-2">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedMainId((current) => current === item.key && window.matchMedia("(max-width: 1279px)").matches ? "" : item.key);
                        }}
                        className={`flex h-12 min-h-12 w-full items-center justify-center overflow-hidden rounded-xl border px-3 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${isSelected ? "border-transparent bg-foreground text-background shadow-sm" : "border-foreground/10 text-foreground hover:border-foreground/25 hover:bg-foreground/5"}`}
                        style={{
                          borderColor: accent,
                          borderInlineStartWidth: 4,
                          borderInlineStartColor: accent,
                        }}
                      >
                        <span className="w-full min-w-0 truncate whitespace-nowrap text-center text-sm font-medium leading-snug sm:text-base" title={t(`items.${committee.id}.name`)}>
                          {t(`items.${committee.id}.name`)}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isSelected && (
                          <motion.div
                            key={`mobile-${item.key}`}
                            initial={false}
                            animate={{ opacity: 1 }}
                            exit={reduceMotion ? undefined : { opacity: 0 }}
                            transition={{ opacity: { duration: reduceMotion ? 0.01 : 0.2, ease: "easeOut" } }}
                            className="mx-auto w-full min-w-0 sm:max-w-2xl xl:hidden"
                          >
                            <CommitteeCard committee={committee} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
