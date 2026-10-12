"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowUpRight, CalendarX2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { MyEventTile } from "@/components/dashboard/mock-data";
import { useDemoRegistrationChanges } from "@/lib/user-registrations/demo-state";
import { getCurrentUserRegistrations } from "@/lib/user-registrations/repository";
import type { UserRegistration } from "@/lib/user-registrations/types";
import { MEMBER_EVENTS_PATH, selectDashboardRegistrations } from "./member-events";

type CardsState =
  | { status: "loading" }
  | { status: "ready"; registrations: UserRegistration[] }
  | { status: "unavailable" };

const dateOptions = { numberingSystem: "latn", month: "short", day: "numeric", year: "numeric" } as const;

/**
 * Member Dashboard "My Events" cards: one card per registration (up to one per
 * colored tile), each opening that registration's own details page.
 */
export function MemberEventCards({ tiles }: { tiles: MyEventTile[] }) {
  const t = useTranslations("dashboard.myEventCards");
  const tr = useTranslations("userRegistrations");
  const format = useFormatter();
  const [state, setState] = useState<CardsState>({ status: "loading" });
  const demo = useDemoRegistrationChanges();

  // Loaded in the browser: which registrations count as "upcoming" depends on the
  // visitor's current time, which a prerendered page cannot know.
  useEffect(() => {
    let active = true;
    getCurrentUserRegistrations()
      .then((result) => {
        if (!active) return;
        setState(
          result.state === "ready"
            ? { status: "ready", registrations: selectDashboardRegistrations(result.registrations, Date.now(), tiles.length) }
            : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [tiles.length]);

  return (
    <section aria-labelledby="my-event-cards-heading">
      <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
        <h2 id="my-event-cards-heading" className="text-xl font-bold text-foreground">
          {t("title")}
        </h2>
        <Link
          href={MEMBER_EVENTS_PATH}
          className="rounded-full px-2 py-1 text-xs font-semibold text-gdg-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/40 sm:text-sm"
        >
          {t("viewAll")}
        </Link>
      </div>

      {state.status === "loading" ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4" aria-busy="true" aria-label={t("loading")}>
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`h-28 animate-pulse rounded-xl opacity-60 motion-reduce:animate-none ${tile.background}`}
            />
          ))}
        </div>
      ) : state.status === "unavailable" || state.registrations.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-5">
          <CalendarX2 className="size-6 shrink-0 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">
            {state.status === "unavailable" ? tr("unavailableDescription") : t("empty")}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {demo.apply(state.registrations).map((registration, index) => {
            const tile = tiles[index];
            return (
              <motion.li
                key={registration.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -2 }}
                className="min-w-0"
              >
                <Link
                  href={`${MEMBER_EVENTS_PATH}/${registration.id}`}
                  className={`group flex h-full min-w-0 flex-col justify-between gap-2 rounded-xl p-2.5 text-foreground transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:p-3 ${tile.background}`}
                >
                  <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug sm:text-base lg:text-lg">{registration.title}</p>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface transition-transform group-hover:scale-110 sm:h-7 sm:w-7"
                    >
                      <ArrowUpRight className={`h-3 w-3 rtl:-scale-x-100 sm:h-3.5 sm:w-3.5 ${tile.accent}`} />
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs text-foreground/70">
                      {format.dateTime(new Date(registration.startsAt), dateOptions)}
                    </span>
                      <span className="rounded-full bg-surface/75 px-2 py-0.5 text-xs font-medium text-foreground">
                      {tr(`status.${registration.status}`)}
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
