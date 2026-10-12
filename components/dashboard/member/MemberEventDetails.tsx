"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowLeft, ArrowUpRight, Calendar, CalendarSearch, Clock, MapPin, QrCode, TimerReset } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RegistrationStatusBadge } from "@/components/user-registrations/RegistrationStatusBadge";
import type { UserRegistration } from "@/lib/user-registrations/types";
import { MEMBER_EVENTS_PATH } from "./member-events";

const dateOptions = { numberingSystem: "latn" } as const;

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gdg-blue-light text-gdg-dark">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}

/** Member-facing details for one of the member's event or trip registrations. */
export function MemberEventDetails({ registration }: { registration: UserRegistration | null }) {
  const t = useTranslations("dashboard.memberEvents");
  const tr = useTranslations("userRegistrations");
  const format = useFormatter();

  const backLink = (
    <Link
      href={MEMBER_EVENTS_PATH}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
    >
      <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      {t("details.back")}
    </Link>
  );

  if (!registration) {
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

  const startsAt = new Date(registration.startsAt);
  const deadline = registration.confirmationDeadline ? new Date(registration.confirmationDeadline) : null;

  let attendance: string | null = null;
  if (registration.checkInStatus === "checked-in") {
    attendance = registration.checkedInAt
      ? tr("attendance.checkedInAt", {
          date: format.dateTime(new Date(registration.checkedInAt), { ...dateOptions, dateStyle: "medium", timeStyle: "short" }),
        })
      : tr("attendance.checkedIn");
  } else if (registration.checkInStatus === "no-show") {
    attendance = tr("attendance.noShow");
  } else if (registration.attendanceConfirmedAt) {
    attendance = tr("attendance.confirmedAt", {
      date: format.dateTime(new Date(registration.attendanceConfirmedAt), { ...dateOptions, dateStyle: "medium", timeStyle: "short" }),
    });
  }

  return (
    <div className="w-full max-w-4xl space-y-6 text-foreground">
      {backLink}

      <article className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-gdg-gray-light">
        <div aria-hidden="true" className="h-2 w-full bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-yellow" />
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">{tr(`kind.${registration.kind}`)}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-foreground/25" />
            <RegistrationStatusBadge status={registration.status} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{registration.title}</h2>

          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 border-y border-border py-6 sm:grid-cols-2">
            <DetailRow icon={<Calendar className="size-4" />} label={t("details.date")}>
              {format.dateTime(startsAt, { ...dateOptions, dateStyle: "full" })}
            </DetailRow>
            <DetailRow icon={<Clock className="size-4" />} label={t("details.time")}>
              {format.dateTime(startsAt, { ...dateOptions, timeStyle: "short" })}
            </DetailRow>
            <DetailRow icon={<MapPin className="size-4" />} label={t("details.location")}>
              {registration.location}
            </DetailRow>
            {deadline && (
              <DetailRow icon={<TimerReset className="size-4" />} label={t("details.confirmBy")}>
                {format.dateTime(deadline, { ...dateOptions, dateStyle: "medium", timeStyle: "short" })}
              </DetailRow>
            )}
            {attendance && (
              <DetailRow icon={<QrCode className="size-4" />} label={t("details.attendance")}>
                {attendance}
              </DetailRow>
            )}
          </dl>

          {registration.status === "need-confirmation" && (
            <p className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-foreground/80">
              {tr("confirmPrompt")}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">{t("details.manageHint")}</p>
            <Link
              href="/registrations"
              className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-gdg-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-gdg-blue/90"
            >
              {t("details.manage")}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
