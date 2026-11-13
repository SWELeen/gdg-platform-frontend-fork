"use client";

import { useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import type { Committee } from "./CommitteeCard";
import CommitteePersonCard from "./CommitteePersonCard";

type Props = {
  items: { committee: Committee; subId?: string }[];
  label: string;
  id: string;
};

// The accordion owns its state and height animation. Desktop portrait and flex
// animations deliberately remain in CommitteeGallery.
export default function MobileCommitteeAccordion({ items, label, id }: Props) {
  const t = useTranslations("home.committees");
  const dir = useTextDirection();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div dir={dir} className="min-w-0">
      <h3 className="mb-4 text-2xl leading-snug font-semibold text-foreground">{label}</h3>
      <div className="space-y-3">
        {items.map(({ committee, subId }, index) => {
          const active = committee.subCommittees?.find((sub) => sub.id === subId) ?? committee;
          const base = subId ? `items.${committee.id}.subCommittees.${subId}` : `items.${committee.id}`;
          const name = t(`${base}.name`);
          const open = selected === index;
          const panelId = `${id}-mobile-${active.id}`;
          // Explicit physical order inside the pair, independent of text direction.
          const people = [
            ...(active.coLeader ? [{ person: active.coLeader, role: "coLeader", label: "coLeaderLabel", name: t(`${base}.coLeaderName`) }] : []),
            { person: active.lead, role: "lead", label: "leadLabel", name: t(`${base}.leadName`) },
          ];

          return (
            <article
              key={active.id}
              className="overflow-hidden rounded-2xl bg-linear-to-br from-(--committee-accent) to-gdg-dark text-white"
              style={{ "--committee-accent": active.color } as CSSProperties}
              onKeyDown={(event) => {
                if (event.key === "Escape" && open) {
                  event.preventDefault();
                  setSelected(null);
                  buttons.current[index]?.focus({ preventScroll: true });
                }
              }}
            >
              <h4>
                <button
                  ref={(node) => { buttons.current[index] = node; }}
                  id={`${panelId}-trigger`}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-label={name}
                  className="flex min-h-20 w-full cursor-pointer items-center gap-2 px-4 text-start focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gdg-yellow"
                  onClick={() => setSelected(open ? null : index)}
                  onKeyDown={(event) => {
                    let next: number;
                    if (event.key === "ArrowDown") next = (index + 1) % items.length;
                    else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = items.length - 1;
                    else return;
                    event.preventDefault();
                    buttons.current[next]?.focus();
                  }}
                >
                  <span className={`min-w-0 flex-1 text-balance break-words font-semibold ${open ? "text-xl" : "text-sm sm:text-base"}`}>{name}</span>
                  {!open && (
                    <>
                      <span aria-hidden="true" className="shrink-0 text-xl tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                      <span aria-hidden="true" dir="ltr" className="flex h-20 w-20 shrink-0 items-end sm:w-28">
                        {people.map(({ person, role }) => (
                          // Separate thumbnail nodes keep expanded portraits from
                          // scaling or changing crop during the height transition.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={role} src={person.image?.trim() || "/images/unknown.png"} alt="" className="h-full min-w-0 flex-1 object-contain object-bottom" onError={portraitFallback} />
                        ))}
                      </span>
                    </>
                  )}
                  {open ? <X aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.3} /> : <Plus aria-hidden="true" className="size-6 shrink-0 text-gdg-yellow" />}
                </button>
              </h4>
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={`${panelId}-trigger`}
                aria-hidden={!open}
                inert={!open}
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 0.68, 0, 1] }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-start text-base leading-normal text-white/90">{t(`${base}.description`)}</p>
                <div dir="ltr" className={`mx-4 grid items-stretch gap-2 border-t border-white/20 pt-3 ${people.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {people.map(({ person, role, name: personName, label: labelKey }, personIndex) => (
                    <div key={role} className="flex min-w-0 flex-col">
                      <CommitteePersonCard
                        alt={personName}
                        label={t.has(`${base}.${labelKey}`) ? t(`${base}.${labelKey}`) : t(labelKey)}
                        name={personName}
                        dir={dir}
                        accentColor={active.color}
                        index={personIndex}
                        layoutClass="w-full flex-1 [&_h4]:text-base [&_p]:leading-normal"
                        linkedin={person.linkedin}
                        x={person.x}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={person.image?.trim() || "/images/unknown.png"} alt="" className="h-40 w-full object-contain object-bottom sm:h-48" loading="lazy" onError={portraitFallback} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function portraitFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  if (!event.currentTarget.src.endsWith("/images/unknown.png")) {
    event.currentTarget.src = "/images/unknown.png";
  }
}
