"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type RegistrationAction = "confirm" | "cancel";

type RegistrationActionDialogProps = {
  action: RegistrationAction;
  registrationTitle: string;
  onDismiss: () => void;
  onApprove: () => void;
  isSubmitting?: boolean;
};

export function RegistrationActionDialog({
  action,
  registrationTitle,
  onDismiss,
  onApprove,
  isSubmitting = false,
}: RegistrationActionDialogProps) {
  const t = useTranslations("userRegistrations.actionDialog");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  const isConfirm = action === "confirm";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="registration-action-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/50"
    >
      <div className="p-6 sm:p-8">
        <h2 id="registration-action-title" className="text-xl font-bold">
          {t(isConfirm ? "confirmTitle" : "cancelTitle")}
        </h2>
        <p className="mt-3 text-sm font-semibold text-foreground/90">
          {registrationTitle}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          {t(isConfirm ? "confirmMessage" : "cancelMessage")}
        </p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
          >
            {t("backButton")}
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={isSubmitting}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
              isConfirm
                ? "bg-blue hover:bg-blue/90"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {t(isSubmitting ? "submitting" : isConfirm ? "confirmButton" : "cancelButton")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
