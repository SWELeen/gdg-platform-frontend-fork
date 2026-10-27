"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, CameraOff, Check, CircleAlert, ScanLine } from "lucide-react";
import type { CommitteeEvent, EventRegistration } from "../shared/types";
import { checkInAttendance, type AttendanceCheckInResult } from "@/lib/attendance/repository";
import { useLeaderDashboard } from "@/components/dashboard/shared/LeaderDashboardContext";

function AttendanceScanner({ onToken }: { onToken: (token: string) => void }) {
  const t = useTranslations("attendance");
  const onTokenRef = useRef(onToken);
  const scannerId = `attendance-qr-reader-${useId().replace(/:/g, "")}`;
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!cameraActive) return;

    let disposed = false;
    let tokenHandled = false;
    let scanner: import("html5-qrcode").Html5Qrcode | undefined;
    let startPromise: Promise<void> | undefined;

    void import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (disposed) return;

      scanner = new Html5Qrcode(scannerId, { verbose: false });
      startPromise = scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        (decodedText) => {
          if (tokenHandled) return;
          tokenHandled = true;
          onTokenRef.current(decodedText);
          setCameraActive(false);
        },
        () => undefined,
      ).then(() => undefined);

      void startPromise?.catch(() => {
        if (!disposed) {
          setCameraError(t("scanner.cameraDenied"));
          setCameraActive(false);
        }
      });
    }).catch(() => {
      if (!disposed) {
        setCameraError(t("scanner.readFailed"));
        setCameraActive(false);
      }
    });

    return () => {
      disposed = true;
      void (async () => {
        try {
          await startPromise;
          if (scanner?.isScanning) await scanner.stop();
          scanner?.clear();
        } catch {
          // The camera may already be stopped when the scanner unmounts.
        }
      })();
    };
  }, [cameraActive, scannerId, t]);

  const submitManualToken = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = manualToken.trim();
    if (!token) return;
    setManualToken("");
    onTokenRef.current(token);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{t("scanner.title")}</h4>
          <p className="mt-1 text-xs leading-5 text-muted">{t("scanner.description")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCameraError(null);
            if (!cameraActive && !navigator.mediaDevices?.getUserMedia) {
              setCameraError(t("scanner.cameraDenied"));
              return;
            }
            setCameraActive((active) => !active);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
        >
          {cameraActive ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
          {cameraActive ? t("scanner.stopCamera") : t("scanner.startCamera")}
        </button>
      </div>

      {cameraActive && (
        <div className="relative mt-4 aspect-video max-h-72 overflow-hidden rounded-xl bg-black">
          <div id={scannerId} className="size-full [&_video]:size-full [&_video]:object-cover" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="size-44 rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.2)]" />
          </div>
        </div>
      )}

      {cameraError && (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted">
          <CircleAlert className="size-4 shrink-0" /> {cameraError}
        </p>
      )}

      <form onSubmit={submitManualToken} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="attendance-token">{t("scanner.manualLabel")}</label>
        <input
          id="attendance-token"
          type="password"
          autoComplete="off"
          value={manualToken}
          onChange={(event) => setManualToken(event.target.value)}
          placeholder={t("scanner.manualPlaceholder")}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-blue"
        />
        <button
          type="submit"
          disabled={!manualToken.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ScanLine className="size-4" /> {t("scanner.submitToken")}
        </button>
      </form>
    </div>
  );
}

function AttendanceMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "yellow" | "red";
}) {
  const tones = {
    blue: "border-blue/20 bg-blue/5",
    green: "border-gdg-green/20 bg-gdg-green/5",
    yellow: "border-gdg-yellow/25 bg-gdg-yellow/10",
    red: "border-gdg-red/20 bg-gdg-red/5",
  };
  return (
    <div className={`rounded-xl border p-3.5 ${tones[tone]}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export function PRAttendancePanel({
  event,
  registrations,
}: {
  event: CommitteeEvent;
  registrations: EventRegistration[];
}) {
  const t = useTranslations("attendance");
  const { reloadRegistrations } = useLeaderDashboard();
  const [verificationState, setVerificationState] = useState<
    AttendanceCheckInResult["state"] | null
  >(null);

  const accepted = registrations.filter((item) => item.status === "Accepted");
  const confirmed = accepted.filter((item) => item.confirmationStatus === "Confirmed");
  const checkedIn = accepted.filter((item) => item.checkInStatus === "CheckedIn");
  const noShow = accepted.filter((item) => item.checkInStatus === "NoShow");
  const attendanceRate = confirmed.length
    ? Math.round((checkedIn.length / confirmed.length) * 100)
    : 0;

  const handleToken = async (token: string) => {
    setVerificationState(null);
    const result = await checkInAttendance({ eventId: event.id, token });
    setVerificationState(result.state);
    if (result.state === "checked-in") await reloadRegistrations(event.id);
  };

  const checkInLabel = (registration: EventRegistration) => {
    if (registration.status !== "Accepted") return t("table.notAccepted");
    if (registration.checkInStatus === "CheckedIn") return t("table.checkedIn");
    if (registration.checkInStatus === "NoShow") return t("table.noShow");
    return t("table.notCheckedIn");
  };

  const confirmationLabel = (registration: EventRegistration) => {
    if (registration.status !== "Accepted") return t("table.notApplicable");
    if (registration.confirmationStatus === "Confirmed") return t("table.confirmed");
    if (registration.confirmationStatus === "Declined") return t("table.declined");
    if (registration.confirmationStatus === "Expired") return t("table.expired");
    return t("table.awaitingConfirmation");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
      <div className="border-b border-border/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue">{t("eyebrow")}</p>
            <h3 className="mt-1 text-lg font-bold text-foreground">{t("title")}</h3>
            <p className="mt-1 text-xs text-muted">{t("description")}</p>
          </div>
          <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">
            {event.title}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AttendanceMetric label={t("metrics.accepted")} value={accepted.length} tone="blue" />
          <AttendanceMetric label={t("metrics.confirmed")} value={confirmed.length} tone="green" />
          <AttendanceMetric label={t("metrics.checkedIn")} value={checkedIn.length} tone="yellow" />
          <AttendanceMetric label={t("metrics.noShow")} value={noShow.length} tone="red" />
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{t("metrics.attendanceRate")}</p>
            <p className="text-sm font-bold text-foreground">{attendanceRate}%</p>
          </div>
          <div
            role="progressbar"
            aria-label={t("metrics.attendanceRate")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={attendanceRate}
            className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
          >
            <div className="h-full rounded-full bg-gdg-green transition-[width]" style={{ width: `${attendanceRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("metrics.attendanceRateDetail", { checkedIn: checkedIn.length, confirmed: confirmed.length })}
          </p>
        </div>

        <AttendanceScanner onToken={handleToken} />
        {verificationState && (
          <p
            role="status"
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
              verificationState === "checked-in"
                ? "border-gdg-green/20 bg-gdg-green/5 text-gdg-green"
                : "border-border bg-surface-muted/30 text-muted"
            }`}
          >
            {verificationState === "checked-in" ? <Check className="size-4" /> : <CircleAlert className="size-4" />}
            {t(`scanner.result.${verificationState}`)}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-surface-muted/30 px-4 py-3">
            <h4 className="text-sm font-semibold text-foreground">{t("table.title")}</h4>
          </div>
          {registrations.length === 0 ? (
            <p className="p-5 text-sm text-muted">{t("table.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] text-start text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 text-start">{t("table.person")}</th>
                    <th className="px-4 py-3 text-start">{t("table.confirmation")}</th>
                    <th className="px-4 py-3 text-start">{t("table.attendance")}</th>
                    <th className="px-4 py-3 text-start">{t("table.checkInTime")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="align-top hover:bg-surface-muted/20">
                      <td className="px-4 py-3.5">
                        <span className="block font-semibold text-foreground">{registration.applicantName}</span>
                        <span className="mt-0.5 block text-muted">{registration.email}</span>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{confirmationLabel(registration)}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full bg-surface-muted px-2.5 py-1 font-medium text-foreground/80">
                          {checkInLabel(registration)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {registration.checkedInAt ?? t("table.noTime")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
