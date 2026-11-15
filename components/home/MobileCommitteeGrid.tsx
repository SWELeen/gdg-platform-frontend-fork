"use client";

import { useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import type { Committee } from "./CommitteeCard";
import CommitteePersonCard from "./CommitteePersonCard";

type Props = {
  items: { committee: Committee; subId?: string }[];
  label: string;
  id: string;
};

export default function MobileCommitteeGrid({ items, label, id }: Props) {
  const t = useTranslations("home.committees");
  const dir = useTextDirection();
  const reduceMotion = useReducedMotion();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  // Retain the outgoing content until its height reaches zero. The latest
  // selection then opens in its own row, without two panels or stale links.
  const [displayed, setDisplayed] = useState<number | null>(null);

  const entries = items.map(({ committee, subId }) => {
    const active = committee.subCommittees?.find((sub) => sub.id === subId) ?? committee;
    const base = subId ? `items.${committee.id}.subCommittees.${subId}` : `items.${committee.id}`;
    return {
      active,
      base,
      name: t(`${base}.name`),
      // Physical portrait order is independent of the locale's reading order.
      people: [
        ...(active.coLeader ? [{ person: active.coLeader, role: "coLeader", label: "coLeaderLabel", name: t(`${base}.coLeaderName`) }] : []),
        { person: active.lead, role: "lead", label: "leadLabel", name: t(`${base}.leadName`) },
      ],
    };
  });
  const detail = displayed === null ? undefined : entries[displayed];

  function select(next: number | null) {
    setSelected(next);
    if (displayed === null) setDisplayed(next);
  }

  function close() {
    select(null);
    buttons.current[selected ?? displayed ?? 0]?.focus({ preventScroll: true });
  }

  return (
    <div
      dir={dir}
      className="min-w-0"
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected !== null) {
          event.preventDefault();
          close();
        }
      }}
    >
      <h3 className="mb-4 text-2xl leading-snug font-semibold text-foreground">{label}</h3>
      <div className="space-y-3">
        {Array.from({ length: Math.ceil(entries.length / 2) }, (_, row) => {
          const rowStart = row * 2;
          const containsDetail = displayed !== null && Math.floor(displayed / 2) === row;
          const open = containsDetail && selected === displayed;
          const panelId = `${id}-mobile-row-${row}`;

          return (
            <div key={row} className="min-w-0">
              <div className="grid grid-cols-2 items-stretch gap-3">
                {entries.slice(rowStart, rowStart + 2).map(({ active, name, people }, column) => {
                  const index = rowStart + column;
                  const isSelected = selected === index;

                  return (
                    <button
                      key={active.id}
                      ref={(node) => { buttons.current[index] = node; }}
                      id={`${id}-mobile-${active.id}-trigger`}
                      type="button"
                      aria-expanded={isSelected && open}
                      aria-controls={panelId}
                      aria-label={name}
                      className={`group relative isolate flex h-32 min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-linear-to-br from-(--committee-accent) to-gdg-dark text-start text-white contain-paint transition-[filter,box-shadow] duration-300 ease-out hover:brightness-110 focus-visible:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gdg-yellow active:brightness-110 motion-reduce:transition-none sm:h-36 ${isSelected ? "brightness-105 ring-2 ring-(--committee-accent)/70 ring-inset" : ""}`}
                      style={{ "--committee-accent": active.color } as CSSProperties}
                      onClick={() => select(isSelected ? null : index)}
                      onKeyDown={(event) => {
                        let next: number;
                        if (event.key === "ArrowDown") next = index + 2;
                        else if (event.key === "ArrowUp") next = index - 2;
                        else if (event.key === "ArrowRight") next = index + (dir === "rtl" ? -1 : 1);
                        else if (event.key === "ArrowLeft") next = index + (dir === "rtl" ? 1 : -1);
                        else if (event.key === "Home") next = 0;
                        else if (event.key === "End") next = entries.length - 1;
                        else return;
                        event.preventDefault();
                        buttons.current[(next + entries.length) % entries.length]?.focus();
                      }}
                    >
                      <span className="flex min-h-0 w-full flex-1 items-start p-2.5">
                        <span className="min-w-0 flex-1 text-sm leading-snug font-semibold text-balance break-words">{name}</span>
                      </span>
                      <span className="flex h-16 w-full shrink-0 items-end gap-1 overflow-hidden sm:h-20">
                        <span aria-hidden="true" className="ms-2.5 mb-2.5 shrink-0 text-xl leading-none tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                        <span aria-hidden="true" dir="ltr" className="flex h-full min-w-0 flex-1 items-end overflow-hidden">
                          {people.map(({ person, role }) => (
                            // Thumbnails never morph into the detail portraits.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img loading="lazy" decoding="async" key={role} src={person.image?.trim() || "/images/unknown.png"} alt="" className="h-full min-w-0 flex-1 object-contain object-bottom transition-[filter] duration-300 ease-out group-hover:brightness-105 group-focus-visible:brightness-105 group-active:brightness-105 motion-reduce:transition-none" onError={portraitFallback} />
                          ))}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* This full-width slot follows both cards, never an individual
                  cell. Its padding collapses too, leaving no empty grid space. */}
              <motion.div
                id={panelId}
                role={containsDetail ? "region" : undefined}
                aria-labelledby={containsDetail && detail ? `${id}-mobile-${detail.active.id}-trigger` : undefined}
                aria-hidden={!open}
                inert={!open}
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : open ? 0.35 : 0.2, ease: [0.22, 0.68, 0, 1] }}
                onAnimationComplete={() => {
                  if (containsDetail && !open) setDisplayed(selected);
                }}
                className="overflow-hidden"
              >
                {containsDetail && detail && (
                  <div className="pt-3">
                    <article
                      className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-(--committee-accent) to-gdg-dark text-white contain-paint"
                      style={{ "--committee-accent": detail.active.color } as CSSProperties}
                    >
                      <div className="flex items-start justify-between gap-3 p-4">
                        <h4 className="min-w-0 text-xl leading-normal font-semibold break-words">{detail.name}</h4>
                        <button
                          type="button"
                          aria-label={t("closeDetails")}
                          aria-controls={panelId}
                          className="-me-2 -mt-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-gdg-yellow"
                          onClick={close}
                        >
                          <X aria-hidden="true" className="size-5" strokeWidth={1.3} />
                        </button>
                      </div>
                      <p className="px-4 pb-4 text-start text-base leading-normal text-white/90">{t(`${detail.base}.description`)}</p>
                      <div dir="ltr" className={`mx-4 grid items-stretch gap-2 border-t border-white/20 pt-3 ${detail.people.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {detail.people.map(({ person, role, name: personName, label: labelKey }, personIndex) => (
                          <div key={role} className="flex min-w-0 flex-col">
                            <CommitteePersonCard
                              alt={personName}
                              label={t.has(`${detail.base}.${labelKey}`) ? t(`${detail.base}.${labelKey}`) : t(labelKey)}
                              name={personName}
                              dir={dir}
                              accentColor={detail.active.color}
                              index={personIndex}
                              layoutClass="w-full flex-1 [&_h4]:text-base [&_p]:leading-normal"
                              linkedin={person.linkedin}
                              x={person.x}
                            />
                            <div className="h-40 w-full shrink-0 overflow-hidden sm:h-48">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img loading="lazy" decoding="async" src={person.image?.trim() || "/images/unknown.png"} alt="" className="h-full w-full object-contain object-bottom" onError={portraitFallback} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function portraitFallback(event: SyntheticEvent<HTMLImageElement>) {
  if (!event.currentTarget.src.endsWith("/images/unknown.png")) {
    event.currentTarget.src = "/images/unknown.png";
  }
}
