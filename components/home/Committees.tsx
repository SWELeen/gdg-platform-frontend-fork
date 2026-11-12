"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import CommitteeCard, { type Committee } from "./CommitteeCard";
import { committees } from "@/data/home";
import { useTextDirection } from "@/i18n/useTextDirection";

// Reference-specific motion: preserve the panel proportions and easing without
// adding layout tokens or changing the shared design system.
const panelEase = [0.22, 0.68, 0, 1] as const;
const navigationButtonClass = "pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-white/50 bg-gdg-dark/25 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gdg-yellow";

type GalleryItem = { committee: Committee; subId?: string };
const mainItems = committees
  .filter((item) => item.id !== "developers")
  .map((committee) => ({ committee }));
const developers: Committee | undefined = committees.find((item) => item.id === "developers");
const developerItems: GalleryItem[] = developers?.subCommittees?.map((sub) => ({ committee: developers, subId: sub.id })) ?? [];

function CommitteeGallery({ items, label, id }: { items: GalleryItem[]; label: string; id: string }) {
  const t = useTranslations("home.committees");
  const dir = useTextDirection();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const step = (delta: number) => {
    if (!items.length) return;
    const next = ((selected ?? (delta > 0 ? -1 : 0)) + delta + items.length) % items.length;
    setSelected(next);
    buttons.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div className="min-w-0">
      <h3 className="mb-4 text-2xl leading-snug font-semibold text-foreground">{label}</h3>
      <div
        className="relative isolate flex flex-col overflow-hidden bg-gdg-dark shadow-xl md:aspect-3/1 md:min-h-min md:flex-row"
        dir={dir}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setSelected(null);
            buttons.current[selected ?? 0]?.focus({ preventScroll: true });
          }
          if (!buttons.current.some((button) => button === event.target)) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            step((event.key === "ArrowRight" ? 1 : -1) * (dir === "rtl" ? -1 : 1));
          }
        }}
      >
        {items.map(({ committee, subId }, index) => {
          const active = committee.subCommittees?.find((sub) => sub.id === subId) ?? committee;
          const base = subId ? `items.${committee.id}.subCommittees.${subId}` : `items.${committee.id}`;
          const name = t(`${base}.name`);
          const open = selected === index;
          const highlighted = open || hovered === index || focused === index;
          const panelId = `${id}-${active.id}`;

          return (
            <motion.div
              key={active.id}
              className="group/panel relative min-h-24 min-w-0 shrink-0 basis-auto overflow-hidden border-e border-white/15 bg-linear-to-br from-(--committee-accent) to-gdg-dark md:flex-1"
              style={{ "--committee-accent": active.color } as CSSProperties}
              animate={{ flexGrow: selected !== null ? (open ? 5 : 0.28) : highlighted ? 1.3 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, ease: panelEase }}
              onHoverStart={() => setHovered(index)}
              onHoverEnd={() => setHovered(null)}
              onFocusCapture={() => setFocused(index)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
              }}
            >
              <div className={open
                ? "relative aspect-3/1 w-full overflow-hidden md:absolute md:inset-y-0 md:start-0 md:aspect-auto md:h-full md:w-1/3"
                : "absolute inset-0 h-full w-full overflow-hidden"}
              >
                <motion.img
                  className="me-auto block h-full w-2/3 object-contain object-bottom-left rtl:object-bottom-right"
                  src={active.lead.image}
                  alt=""
                  loading="lazy"
                  animate={{
                    scale: reduceMotion || highlighted ? 1 : 1.035,
                    filter: highlighted
                      ? "grayscale(0) brightness(.85)"
                      : "grayscale(1) brightness(.55) sepia(.2) hue-rotate(155deg)",
                  }}
                  transition={{
                    scale: { duration: reduceMotion ? 0 : 0.9, ease: panelEase },
                    filter: { duration: reduceMotion ? 0 : 0.5, ease: "easeOut" },
                  }}
                  onError={(event) => {
                    if (!event.currentTarget.src.endsWith("/images/unknown.png")) {
                      event.currentTarget.src = "/images/unknown.png";
                    }
                  }}
                />
              </div>
              <span
                aria-hidden="true"
                className={open
                  ? "pointer-events-none absolute inset-0 bg-linear-to-t from-gdg-dark via-gdg-dark/50 to-transparent md:bg-linear-to-r md:from-transparent md:via-gdg-dark/50 md:to-gdg-dark md:rtl:bg-linear-to-l"
                  : "pointer-events-none absolute inset-0 bg-linear-to-t from-gdg-dark/80 to-transparent"}
              />
              <button
                ref={(node) => { buttons.current[index] = node; }}
                type="button"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer text-start text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gdg-yellow"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={name}
                onClick={() => setSelected(open ? null : index)}
              >
                <span
                  className={`absolute start-4 bottom-4 text-3xl leading-none font-normal ${selected !== null && !open ? "md:opacity-0" : ""}`}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {!open && (
                  <span className="absolute start-20 end-4 top-5 md:start-auto md:end-5">
                    <span className="flex items-center justify-between gap-3 text-sm leading-none font-medium md:rotate-180 md:justify-normal md:[writing-mode:vertical-rl]">
                      <span>{name}</span>
                      <span className="text-2xl leading-none text-gdg-yellow" aria-hidden="true">+</span>
                    </span>
                  </span>
                )}
                {open && <X className="absolute top-5 end-5 size-7" strokeWidth={1} aria-hidden="true" />}
              </button>
              <div
                id={panelId}
                hidden={!open}
                className="pointer-events-none relative z-20 grid grid-cols-1 gap-4 px-6 pt-4 pb-12 md:grid-cols-3 md:px-8 md:py-8"
              >
                {open && (
                  <div className="min-w-0 md:col-span-2 md:col-start-2">
                    <CommitteeCard committee={committee} initialSubCommitteeId={subId} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {items.length > 1 && (
          <div className="pointer-events-none absolute inset-x-5 top-1/2 z-30 hidden -translate-y-1/2 justify-between md:flex">
            <button className={navigationButtonClass} type="button" aria-label={t("previousCommittee")} onClick={() => step(-1)}>
              <ChevronLeft className="size-6 rtl:rotate-180" strokeWidth={1.3} />
            </button>
            <button className={navigationButtonClass} type="button" aria-label={t("nextCommittee")} onClick={() => step(1)}>
              <ChevronRight className="size-6 rtl:rotate-180" strokeWidth={1.3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Committees() {
  const t = useTranslations("home.committees");
  return (
    <section id="committees" className="bg-background px-6 py-8">
      <div className="pb-8 sm:pb-10">
        <h2 className="text-start text-3xl leading-snug font-bold text-foreground">
          {t("title")}{" "}
          <span className="bg-(image:--google-gradient) bg-clip-text pe-1 italic text-transparent rtl:not-italic">{t("highlight")}</span>
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-normal font-normal text-foreground/60">{t("subtitle")}</p>
      </div>
      <div className="mx-auto w-full max-w-5xl space-y-8 md:w-11/12">
        <CommitteeGallery items={mainItems} label={t("mainCommitteesLabel")} id="main-committee" />
        <CommitteeGallery items={developerItems} label={t("developerCommitteesLabel")} id="developer-committee" />
      </div>
    </section>
  );
}
