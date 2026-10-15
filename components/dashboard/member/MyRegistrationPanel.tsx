"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CircleAlert, CircleCheck, Info, RotateCcw } from "lucide-react";
import { RegistrationStatusBadge } from "@/components/user-registrations/RegistrationStatusBadge";
import {
  cancelRegistration,
  confirmRegistration,
  resetDemoRegistration,
  type RegistrationActionResult,
} from "@/lib/user-registrations/demo-state";
import type { RegistrationAvailability } from "@/lib/user-registrations/rules";
import type { UserRegistration } from "@/lib/user-registrations/types";
import { AttendanceTicket } from "./AttendanceTicket";
import { RegistrationActionConfirmDialog, type RegistrationAction } from "./RegistrationActionConfirmDialog";

const dateOptions = { numberingSystem: "latn", dateStyle: "medium", timeStyle: "short" } as const;

type Feedback = { tone: "success" | "error"; message: string } | null;

/** Explains the member's registration state and offers only the actions it allows. */
export function MyRegistrationPanel({
  registration,
  availability,
  ready,
  isDemoChanged,
}: {
  registration: UserRegistration;
  /** Null until the browser's clock is known (actions depend on deadlines). */
  availability: RegistrationAvailability | null;
  ready: boolean;
  isDemoChanged: boolean;
}) {
  const t = useTranslations("dashboard.memberEvents.registration");
  const format = useFormatter();
  const [pendingAction, setPendingAction] = useState<RegistrationAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const deadline = registration.confirmationDeadline
    ? format.dateTime(new Date(registration.confirmationDeadline), dateOptions)
    : null;

  let explanationKey: string;
  switch (registration.status) {
    case "need-confirmation":
      explanationKey = availability?.confirmationExpired ? "explain.expired" : deadline ? "explain.needConfirmation" : "explain.needConfirmationNoDeadline";
      break;
    case "approved":
      explanationKey = availability?.hasTicket ? "explain.confirmed" : "explain.approved";
      break;
    case "not-attended":
      explanationKey = "explain.notAttended";
      break;
    default:
      explanationKey = `explain.${registration.status}`;
  }

  // Registration approval and attendance confirmation are separate steps.
  const approvalKey =
    registration.status === "pending"
      ? "approval.pending"
      : registration.status === "declined"
        ? "approval.declined"
        : registration.status === "cancelled"
          ? "approval.cancelled"
          : "approval.accepted";
  const attendanceKey =
    registration.status === "attended" || registration.checkInStatus === "checked-in"
      ? "attendanceStep.attended"
      : registration.status === "not-attended" || registration.checkInStatus === "no-show"
        ? "attendanceStep.notAttended"
        : registration.attendanceConfirmationStatus === "confirmed"
          ? "attendanceStep.confirmed"
          : registration.status === "need-confirmation"
            ? availability?.confirmationExpired
              ? "attendanceStep.expired"
              : "attendanceStep.awaiting"
            : "attendanceStep.notRequired";

  const runAction = async () => {
    if (!pendingAction || busy) return;
    setBusy(true);
    let result: RegistrationActionResult;
    try {
      result = pendingAction === "confirm" ? await confirmRegistration(registration) : await cancelRegistration(registration);
    } catch {
      result = { ok: false, reason: "storage-unavailable" };
    }
    setBusy(false);
    setPendingAction(null);
    setFeedback(
      result.ok
        ? { tone: "success", message: t(pendingAction === "confirm" ? "feedback.confirmed" : "feedback.cancelled") }
        : { tone: "error", message: t(`feedback.${result.reason === "not-allowed" ? "notAllowed" : "storageUnavailable"}`) },
    );
  };

  const showActions = availability && (availability.canConfirm || availability.canCancel);

  return (
    <section aria-labelledby="my-registration-title" className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="my-registration-title" className="text-lg font-semibold text-foreground">
          {t("title")}
        </h3>
        <RegistrationStatusBadge status={registration.status} />
      </div>

      <p className="mt-2 text-sm leading-6 text-foreground/80">
        {t(explanationKey, { deadline: deadline ?? "" })}
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border px-4 py-3">
          <dt className="text-xs text-muted">{t("approvalLabel")}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{t(approvalKey)}</dd>
        </div>
        <div className="rounded-xl border border-border px-4 py-3">
          <dt className="text-xs text-muted">{t("attendanceLabel")}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{t(attendanceKey)}</dd>
        </div>
      </dl>

      {availability?.hasStarted && registration.status !== "attended" && registration.status !== "not-attended" && (
        <p className="mt-4 text-xs text-muted">{t("startedNote")}</p>
      )}

      {showActions && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {availability.canConfirm && (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setPendingAction("confirm");
              }}
              disabled={!ready || busy}
              className="rounded-xl bg-gdg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gdg-blue/90 disabled:opacity-60"
            >
              {t("confirmAction")}
            </button>
          )}
          {availability.canCancel && (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setPendingAction("cancel");
              }}
              disabled={!ready || busy}
              className="rounded-xl border border-rose-500/40 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              {t("cancelAction")}
            </button>
          )}
        </div>
      )}

      <div aria-live="polite">
        {feedback && (
          <p
            role={feedback.tone === "error" ? "alert" : "status"}
            className={`mt-4 flex items-start gap-2 text-sm ${
              feedback.tone === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {feedback.tone === "success" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            {feedback.message}
          </p>
        )}
      </div>

      {availability?.hasTicket && <AttendanceTicket registration={registration} />}

      <div className="mt-5 flex flex-col gap-2 rounded-xl bg-surface-muted/50 px-4 py-3 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {t("demoNote")}
        </p>
        {isDemoChanged && (
          <button
            type="button"
            onClick={() => {
              setFeedback(
                resetDemoRegistration(registration.id)
                  ? { tone: "success", message: t("feedback.reset") }
                  : { tone: "error", message: t("feedback.storageUnavailable") },
              );
            }}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-border px-3 py-1.5 font-semibold text-foreground transition hover:bg-surface sm:self-auto"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t("resetDemo")}
          </button>
        )}
      </div>

      {pendingAction && (
        <RegistrationActionConfirmDialog
          action={pendingAction}
          eventTitle={registration.title}
          busy={busy}
          onDismiss={() => setPendingAction(null)}
          onApprove={runAction}
        />
      )}
    </section>
  );
}
