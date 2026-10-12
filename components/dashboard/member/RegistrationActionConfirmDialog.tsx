"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export type RegistrationAction = "confirm" | "cancel";

/**
 * Confirmation step before a member confirms or cancels their registration. Native
 * <dialog> (focus trap, Escape) like the original registrations dialog, plus a busy
 * state so the action can't be submitted twice.
 */
export function RegistrationActionConfirmDialog({
  action,
  eventTitle,
  busy,
  onDismiss,
  onApprove,
}: {
  action: RegistrationAction;
  eventTitle: string;
  busy: boolean;
  onDismiss: () => void;
  onApprove: () => void;
}) {
  const t = useTranslations("userRegistrations.actionDialog");
  const tm = useTranslations("dashboard.memberEvents.registration");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isConfirm = action === "confirm";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="member-registration-dialog-title"
      aria-describedby="member-registration-dialog-message"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onDismiss();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <div className="flex items-start gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              isConfirm
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
            }`}
          >
            {isConfirm ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <AlertTriangle className="size-5" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <h2 id="member-registration-dialog-title" className="text-lg font-bold">
              {t(isConfirm ? "confirmTitle" : "cancelTitle")}
            </h2>
            <p className="mt-1 text-sm font-semibold text-foreground/90">{eventTitle}</p>
          </div>
        </div>
        <div id="member-registration-dialog-message" className="mt-4 space-y-2 text-sm leading-6 text-muted">
          <p>{t(isConfirm ? "confirmMessage" : "cancelMessage")}</p>
          <p className="text-xs">{tm("dialogDemoNote")}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onDismiss}
            disabled={busy}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:opacity-50"
          >
            {t("backButton")}
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            aria-busy={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-70 ${
              isConfirm ? "bg-gdg-blue hover:bg-gdg-blue/90" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {busy && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {busy ? tm("saving") : t(isConfirm ? "confirmButton" : "cancelButton")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
