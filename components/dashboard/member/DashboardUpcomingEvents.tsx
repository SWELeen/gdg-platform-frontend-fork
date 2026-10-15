"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CARD_HEADER, CARD_TITLE, DASHBOARD_CARD } from "@/components/dashboard/members/card-styles";
import { ViewAllBadge } from "@/components/dashboard/members/ViewAllBadge";
import { buildGoogleCalendarUrl } from "@/lib/dashboard/calendar-link";
import { isUpcomingEventDate, parseEventDate, parseEventDateTime, toSaudiIsoDateTime } from "@/lib/dashboard/event-format";
import { getPublishedEvents } from "@/lib/events/repository";
import type { PlatformEvent } from "@/lib/events/types";
import { UPCOMING_EVENTS_PATH } from "./member-events";

const MAX_FEATURED = 3;

type UpcomingState = { status: "loading" } | { status: "ready"; events: PlatformEvent[] } | { status: "error" };

/**
 * Member Dashboard "Upcoming Events": the next published platform events (not the
 * member's own registrations). The header arrow opens the full upcoming list.
 */
export function DashboardUpcomingEvents() {
  const t = useTranslations("dashboard.upcoming");
  const format = useFormatter();
  const [state, setState] = useState<UpcomingState>({ status: "loading" });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let active = true;
    getPublishedEvents()
      .then((events) => {
        if (!active) return;
        const now = Date.now();
        const upcoming = events
          .filter((event) => isUpcomingEventDate(event.date, now))
          .sort(
            (a, b) =>
              (parseEventDateTime(a.date, a.time)?.getTime() ?? 0) - (parseEventDateTime(b.date, b.time)?.getTime() ?? 0),
          )
          .slice(0, MAX_FEATURED);
        setState({ status: "ready", events: upcoming });
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, []);

  const events = state.status === "ready" ? state.events : [];
  const event = events[Math.min(activeIndex, Math.max(0, events.length - 1))];
  const eventDate = event ? parseEventDate(event.date) : null;
  const startsAt = event ? toSaudiIsoDateTime(event.date, event.time) : null;
  const calendarUrl =
    event && startsAt ? buildGoogleCalendarUrl({ title: event.title, startsAt, location: event.location }) : null;

  return (
    <section
      aria-labelledby="dashboard-upcoming-heading"
      className={`flex flex-col ${DASHBOARD_CARD}`}
    >
      <div className={CARD_HEADER}>
        <h2 id="dashboard-upcoming-heading" className={CARD_TITLE}>
          <Calendar className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t("title")}
        </h2>
        <ViewAllBadge href={UPCOMING_EVENTS_PATH} label={t("viewAll")} tone="yellow" />
      </div>

      {state.status === "loading" ? (
        <div
          className="aspect-[16/7] animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none lg:aspect-auto lg:flex-1"
          aria-busy="true"
          aria-label={t("loading")}
        />
      ) : !event ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-muted/40 px-4 py-10 text-center">
          <Calendar className="size-6 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">{state.status === "error" ? t("error") : t("empty")}</p>
        </div>
      ) : (
        <>
           <div className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--event-card-start)] via-gdg-dark to-black">
            {event.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- event image URL of unknown origin; next/image would need a remote pattern. */}
                <img src={event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" aria-hidden="true" />
              </>
            ) : (
              <Calendar className="pointer-events-none absolute end-3 top-3 h-16 w-16 text-[var(--white)]/10" aria-hidden="true" />
            )}
             <div className="relative flex flex-1 aspect-[16/10] sm:aspect-[16/7] lg:aspect-auto min-h-36 flex-col justify-between p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                {eventDate && (
                   <div className="flex flex-col items-center justify-center rounded-lg bg-[var(--white)] px-2.5 py-1 leading-none text-gdg-dark shadow-sm">
                    <span className="text-base font-bold">
                      {format.dateTime(eventDate, { day: "numeric", numberingSystem: "latn" })}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {format.dateTime(eventDate, { month: "short", numberingSystem: "latn" })}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-[var(--white)]">
                  {/* Stretched link: the whole banner opens this event; the calendar link sits above it. */}
                  <Link
                    href={`${UPCOMING_EVENTS_PATH}/${event.id}`}
                    className="after:absolute after:inset-0 after:rounded-2xl hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-gdg-yellow-accent"
                  >
                    {event.title}
                  </Link>
                </p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--white)]/70">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {event.location}
                    </span>
                    <span aria-hidden="true">&bull;</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {event.time}
                    </span>
                  </p>
                  {calendarUrl && (
                    <motion.a
                      href={calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("addToCalendarLabel", { title: event.title })}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--white)] px-2.5 py-1 text-sm font-medium text-gdg-dark sm:px-3 sm:py-1.5"
                    >
                      {t("addToCalendar")}
                      <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {events.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5" role="group" aria-label={t("pagerLabel")}>
              {events.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t("showEvent", { number: index + 1, title: item.title })}
                  aria-pressed={item.id === event.id}
                  className="flex h-6 items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/40"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      item.id === event.id ? "w-4 bg-foreground" : "w-1.5 bg-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
