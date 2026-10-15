"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CalendarPlus,
  CalendarSearch,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Users,
  UsersRound,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buildGoogleCalendarUrl } from "@/lib/dashboard/calendar-link";
import { isUpcomingEventDate, parseEventDate, toSaudiIsoDateTime } from "@/lib/dashboard/event-format";
import { useClientNow } from "@/lib/dashboard/use-client-now";
import type { PlatformEvent } from "@/lib/events/types";
import { UPCOMING_EVENTS_PATH } from "./member-events";

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gdg-yellow-light text-gdg-dark">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}

/** Member-facing details for one published platform event. */
export function UpcomingEventDetails({ event }: { event: PlatformEvent | null }) {
  const t = useTranslations("dashboard.upcomingEventsPage");
  const tType = useTranslations("dashboard.leader.eventFilters");
  const format = useFormatter();
  const now = useClientNow();

  const backLink = (
    <Link
      href={UPCOMING_EVENTS_PATH}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
    >
      <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      {t("details.back")}
    </Link>
  );

  if (!event) {
    return (
      <div className="w-full max-w-4xl space-y-6 text-foreground">
        {backLink}
        <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
          <CalendarSearch className="mx-auto size-10 text-muted" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold">{t("details.notFoundTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("details.notFoundDescription")}</p>
        </section>
      </div>
    );
  }

  const date = parseEventDate(event.date);
  const deadline = parseEventDate(event.registrationDeadline);
  const seatsLeft = Math.max(0, event.capacity - event.registered);
  const startsAt = toSaudiIsoDateTime(event.date, event.time);
  const calendarUrl = startsAt ? buildGoogleCalendarUrl({ title: event.title, startsAt, location: event.location }) : null;
  const hasEnded = now !== null && !isUpcomingEventDate(event.date, now);

  return (
    <div className="w-full max-w-4xl space-y-6 text-foreground">
      {backLink}

      <article className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-gdg-gray-light">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- event image URL of unknown origin; next/image would need a remote pattern.
          <img src={event.imageUrl} alt="" className="h-48 w-full object-cover sm:h-64" />
        ) : (
          <div aria-hidden="true" className="h-2 w-full bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-yellow" />
        )}
        <div className="p-5 sm:p-8">
          <span className="text-xs font-semibold text-muted">{tType(event.type.toLowerCase())}</span>
          <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{event.title}</h2>
          {event.description && (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground/80">{event.description}</p>
          )}
          {hasEnded && (
            <p className="mt-4 rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm text-muted">
              {t("details.ended")}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 border-y border-border py-6 sm:grid-cols-2">
            <DetailRow icon={<Calendar className="size-4" />} label={t("details.date")}>
              {date ? format.dateTime(date, { dateStyle: "full", numberingSystem: "latn" }) : event.date}
            </DetailRow>
            <DetailRow icon={<Clock className="size-4" />} label={t("details.time")}>
              {event.time}
            </DetailRow>
            <DetailRow icon={<MapPin className="size-4" />} label={t("details.location")}>
              <span>{event.location}</span>
              {event.mapsLink && (
                <a
                  href={event.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold text-gdg-blue hover:underline"
                >
                  {t("details.openMap")}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              )}
            </DetailRow>
            {event.speakers && (
              <DetailRow icon={<UsersRound className="size-4" />} label={t("details.speakers")}>
                {event.speakers}
              </DetailRow>
            )}
            <DetailRow icon={<Users className="size-4" />} label={t("details.capacity")}>
              {seatsLeft > 0 ? t("seatsLeft", { count: seatsLeft }) : t("full")}
            </DetailRow>
            {deadline && (
              <DetailRow icon={<CalendarClock className="size-4" />} label={t("details.deadline")}>
                {format.dateTime(deadline, { dateStyle: "long", numberingSystem: "latn" })}
              </DetailRow>
            )}
          </dl>

          {event.requirements && (
            <section className="mt-6 flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gdg-yellow-light text-gdg-dark">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">{t("details.requirements")}</h2>
                <p className="mt-0.5 whitespace-pre-line text-sm text-muted">{event.requirements}</p>
              </div>
            </section>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">{t("details.registrationNote")}</p>
            {calendarUrl && !hasEnded && (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-gdg-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-gdg-blue/90"
              >
                <CalendarPlus className="size-4" aria-hidden="true" />
                {t("details.addToCalendar")}
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
