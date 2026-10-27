"use client";

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { RegistrationStatusBadge } from "./RegistrationStatusBadge";
import type { UserRegistration } from "@/lib/user-registrations/types";
import { useClientNow } from "@/lib/dashboard/use-client-now";

// Cancelling a confirmed seat in the final two hours is recorded as late (backend rule).
const LATE_CANCELLATION_MS = 2 * 60 * 60 * 1000;

type RegistrationCardProps = {
  registration: UserRegistration;
  dateAccent: number;
  onConfirm: () => void;
  onCancel: () => void;
  actionFeedback?: {
    action: "confirm" | "cancel";
    state: "success" | "error";
    code?: string;
  } | null;
};

export function RegistrationCard({
  registration,
  dateAccent,
  onConfirm,
  onCancel,
  actionFeedback = null,
}: RegistrationCardProps) {
  const t = useTranslations("userRegistrations");
  const format = useFormatter();
  const startsAt = new Date(registration.startsAt);
  const dateAccentClasses = [
    "bg-blue/10 text-blue ring-blue/15",
    "bg-gdg-red/10 text-gdg-red ring-gdg-red/15",
    "bg-gdg-yellow/15 text-amber-700 ring-gdg-yellow/20 dark:text-amber-300",
    "bg-gdg-green/10 text-gdg-green ring-gdg-green/15",
  ];
  const deadline = registration.confirmationDeadline
    ? new Date(registration.confirmationDeadline)
    : null;
  // A confirmed seat can be given up until the event starts, and a waitlist
  // place at any time; an offer still waiting for a reply has its own buttons.
  const now = useClientNow();
  const canWithdraw = now !== null && (
    registration.status === "waitlisted" ||
    (registration.status === "approved" && registration.checkInStatus !== "checked-in" && now < startsAt.getTime())
  );
  const lateCancellation = registration.status === "approved" && now !== null && now >= startsAt.getTime() - LATE_CANCELLATION_MS;
  const feedback = actionFeedback && (
    <p role={actionFeedback.state === "error" ? "alert" : "status"} className={`mt-3 text-xs ${actionFeedback.state === "error" ? "text-gdg-red" : "text-gdg-green"}`}>
      {actionFeedback.state === "success"
        ? t(actionFeedback.action === "confirm" ? "confirmSuccess" : "cancelSuccess")
        : t(actionFeedback.code === "CONFIRMATION_EXPIRED"
            ? "actionErrors.expired"
            : actionFeedback.code === "INVALID_STATUS_TRANSITION"
              ? "actionErrors.statusChanged"
              : actionFeedback.code === "ATTENDANCE_QR_UNAVAILABLE"
                ? "actionErrors.qrUnavailable"
                : "actionErrors.generic")}
    </p>
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-1 items-start gap-4">
        <div className={`flex h-[76px] w-[68px] shrink-0 flex-col items-center justify-center rounded-xl text-current ring-1 ${dateAccentClasses[dateAccent]}`}>
          <span className="text-xs font-medium">
            {format.dateTime(startsAt, { month: "short" })}
          </span>
          <span className="mt-0.5 text-2xl font-semibold leading-none">
            {format.dateTime(startsAt, { day: "2-digit" })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">
              {t(`kind.${registration.kind}`)}
            </span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-foreground/25" />
            <RegistrationStatusBadge status={registration.status} />
          </div>
          <h3 className="text-base font-bold leading-6 text-foreground sm:text-lg">
            {registration.title}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {format.dateTime(startsAt, { timeStyle: "short" })}
            <span aria-hidden="true" className="mx-2">·</span>
            {registration.location}
          </p>
        </div>
      </div>

      {registration.attendanceConfirmationStatus === "confirmed" && (
        <section className="mt-5 flex flex-col gap-4 rounded-xl border border-gdg-green/20 bg-gdg-green/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">{t("attendance.qrTitle")}</h4>
            <p className="mt-1 text-xs leading-5 text-muted">{t("attendance.qrDescription")}</p>
            {registration.attendanceConfirmedAt && (
              <p className="mt-2 text-xs font-medium text-gdg-green">
                {t("attendance.confirmedAt", {
                  date: format.dateTime(new Date(registration.attendanceConfirmedAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}
              </p>
            )}
            {registration.checkInStatus === "checked-in" && registration.checkedInAt && (
              <p className="mt-2 text-xs font-medium text-gdg-green">
                {t("attendance.checkedInAt", {
                  date: format.dateTime(new Date(registration.checkedInAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}
              </p>
            )}
            {registration.checkInStatus === "no-show" && (
              <p className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                {t("attendance.noShow")}
              </p>
            )}
          </div>
          {registration.attendanceQrCodeDataUrl ? (
            <Image
              src={registration.attendanceQrCodeDataUrl}
              alt={t("attendance.qrAlt")}
              width={144}
              height={144}
              unoptimized
              className="size-36 shrink-0 rounded-lg border border-border bg-white p-2"
            />
          ) : (
            <div className="grid size-36 shrink-0 place-items-center rounded-lg border border-dashed border-border bg-surface px-3 text-center text-xs leading-5 text-muted">
              {t("attendance.qrPending")}
            </div>
          )}
        </section>
      )}
      {registration.status === "need-confirmation" && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm leading-6 text-muted">
            {deadline && !Number.isNaN(deadline.getTime())
              ? t("confirmBefore", {
                  date: format.dateTime(deadline, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })
              : t("confirmPrompt")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue/90"
            >
              {t("confirmAction")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground/75 transition hover:bg-foreground/5"
            >
              {t("cancelAction")}
            </button>
          </div>
          {feedback}
        </div>
      )}
      {canWithdraw && (
        <div className="mt-5 border-t border-border pt-4">
          {lateCancellation && (
            <p className="mb-3 text-xs leading-5 text-amber-700 dark:text-amber-300">{t("lateCancelWarning")}</p>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground/75 transition hover:bg-foreground/5"
          >
            {t(registration.status === "waitlisted" ? "leaveWaitlistAction" : "cancelAction")}
          </button>
          {feedback}
        </div>
      )}
    </article>
  );
}
