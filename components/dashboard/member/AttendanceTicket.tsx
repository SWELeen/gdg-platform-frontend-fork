"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Maximize2, QrCode, Ticket, X } from "lucide-react";
import type { UserRegistration } from "@/lib/user-registrations/types";

const dateOptions = { numberingSystem: "latn" } as const;

function QrDialog({ src, alt, title, onClose }: { src: string; alt: string; title: string; onClose: () => void }) {
  const t = useTranslations("dashboard.memberEvents.ticket");
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-surface p-6 text-center text-foreground shadow-2xl backdrop:bg-black/60"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("closeQr")}
        className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-foreground"
      >
        <X className="size-5" />
      </button>
      <p className="px-8 text-sm font-semibold">{title}</p>
      <Image src={src} alt={alt} width={288} height={288} unoptimized className="mx-auto mt-4 size-72 max-w-full rounded-xl bg-white p-3" />
      <p className="mt-3 text-xs text-muted">{t("showAtEntrance")}</p>
    </dialog>
  );
}

/**
 * The member's attendance ticket. Shows the real QR image only when the ticket service
 * provided one (`attendanceQrCodeDataUrl`); otherwise an honest placeholder. No QR code
 * is ever generated on the client.
 */
export function AttendanceTicket({ registration }: { registration: UserRegistration }) {
  const t = useTranslations("dashboard.memberEvents.ticket");
  const tr = useTranslations("userRegistrations");
  const format = useFormatter();
  const [enlarged, setEnlarged] = useState(false);
  const startsAt = new Date(registration.startsAt);
  const qr = registration.attendanceQrCodeDataUrl;

  return (
    <section
      aria-labelledby="attendance-ticket-title"
      className="mt-5 overflow-hidden rounded-2xl border border-dashed border-gdg-green/50 bg-gdg-green/5"
    >
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h3 id="attendance-ticket-title" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Ticket className="size-4 text-gdg-green" aria-hidden="true" />
            {t("title")}
          </h3>
          <p className="mt-2 text-base font-semibold text-foreground">{registration.title}</p>
          <p className="mt-1 text-sm text-muted">
            {format.dateTime(startsAt, { ...dateOptions, dateStyle: "medium" })}
            <span aria-hidden="true" className="mx-1.5">·</span>
            {format.dateTime(startsAt, { ...dateOptions, timeStyle: "short" })}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gdg-green/15 px-2.5 py-1 text-xs font-semibold text-gdg-green">
            {t("confirmedBadge")}
          </p>
          <p className="mt-3 text-xs leading-5 text-muted">{qr ? t("showAtEntrance") : tr("attendance.qrPending")}</p>
        </div>

        {qr ? (
          <button
            type="button"
            onClick={() => setEnlarged(true)}
            className="group relative shrink-0 self-center rounded-xl border border-border bg-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
            aria-label={t("enlargeQr")}
          >
            <Image src={qr} alt={tr("attendance.qrAlt")} width={144} height={144} unoptimized className="size-36" />
            <span className="absolute bottom-1.5 end-1.5 flex size-7 items-center justify-center rounded-full bg-gdg-dark/80 text-white">
              <Maximize2 className="size-3.5" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <div className="grid size-36 shrink-0 place-items-center self-center rounded-xl border border-dashed border-border bg-surface px-3 text-center">
            <QrCode className="size-8 text-muted" aria-hidden="true" />
            <span className="text-[11px] leading-4 text-muted">{t("qrPlaceholder")}</span>
          </div>
        )}
      </div>
      {enlarged && qr && (
        <QrDialog src={qr} alt={tr("attendance.qrAlt")} title={registration.title} onClose={() => setEnlarged(false)} />
      )}
    </section>
  );
}
