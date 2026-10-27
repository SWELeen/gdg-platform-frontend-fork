"use client";

import { useEffect, useState } from "react";
import { API_ENABLED } from "@/lib/api/client";
import { getCurrentUserRegistrations, respondToRegistration } from "@/lib/user-registrations/repository";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { UserRegistration, UserRegistrationsResult } from "@/lib/user-registrations/types";
import { RegistrationActionDialog } from "./RegistrationActionDialog";
import { RegistrationCard } from "./RegistrationCard";

type RegistrationAction = "confirm" | "cancel";
type RegistrationKind = "event" | "trip";
type PendingAction = {
  registration: UserRegistration;
  action: RegistrationAction;
};

type RegistrationActionFeedback = PendingAction & {
  state: "success" | "error";
  code?: string;
};

export function UserRegistrationsPage({
  result: initialResult = null,
}: {
  result?: UserRegistrationsResult | null;
}) {
  const t = useTranslations("userRegistrations");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionFeedback, setActionFeedback] = useState<RegistrationActionFeedback | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [result, setResult] = useState<UserRegistrationsResult | null>(initialResult);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (initialResult) return;
    let active = true;
    void getCurrentUserRegistrations().then((nextResult) => {
      if (!active) return;
      // Email links often open in a browser that is not signed in yet.
      if (nextResult.state === "signed-out") router.replace(`/login?returnTo=${encodeURIComponent("/registrations")}`);
      else setResult(nextResult);
    });
    return () => { active = false; };
  }, [initialResult, loadAttempt, router]);

  const finishDemoAction = async () => {
    if (!pendingAction || isSubmittingAction) return;
    setIsSubmittingAction(true);
    if (API_ENABLED) {
      try {
        const outcome = await respondToRegistration(
          pendingAction.registration.id,
          pendingAction.action === "confirm" ? "confirm" : "decline",
        );
        setPendingAction(null);
        if (outcome.ok) {
          const nextResult = await getCurrentUserRegistrations();
          setResult(nextResult);
          setActionFeedback({ ...pendingAction, state: "success" });
        } else {
          setActionFeedback({ ...pendingAction, state: "error", code: outcome.code });
        }
      } finally {
        setIsSubmittingAction(false);
      }
      return;
    }
    // Demo mode: no backend, so only show the feedback.
    setActionFeedback({ ...pendingAction, state: "success" });
    setPendingAction(null);
    setIsSubmittingAction(false);
  };

  const registrations = result?.state === "ready" ? result.registrations : [];
  const kinds: RegistrationKind[] = ["event", "trip"];
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {t("description")}
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue/15 bg-blue/5 px-3 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue" />
          {t("sectionCount", { count: registrations.length })}
        </div>
      </header>


      {result === null ? (
        <section className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12" aria-busy="true">
          <p className="text-sm text-muted">{t("loading")}</p>
        </section>
      ) : result.state !== "ready" ? (
        <section role="alert" className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
          <h3 className="text-lg font-semibold">{t("loadErrorTitle")}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            {t("loadErrorDescription")}
          </p>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setLoadAttempt((attempt) => attempt + 1);
            }}
            className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
          >
            {t("retry")}
          </button>
        </section>
      ) : registrations.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
          <h3 className="text-lg font-semibold">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            {t("emptyDescription")}
          </p>
        </section>
      ) : (
        <div className="space-y-12">
          {kinds.map((kind) => {
            const sectionRegistrations = registrations.filter(
              (registration) => registration.kind === kind,
            );
            if (sectionRegistrations.length === 0) return null;

            return (
              <section key={kind} aria-labelledby={`registrations-${kind}`}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h3
                      id={`registrations-${kind}`}
                      className="text-xl font-bold tracking-tight sm:text-2xl"
                    >
                      {t(`sections.${kind === "event" ? "events" : "trips"}`)}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {t("sectionCount", { count: sectionRegistrations.length })}
                    </p>
                  </div>
                  <span aria-hidden="true" className={`h-1 w-16 rounded-full ${kind === "event" ? "bg-blue" : "bg-gdg-green"}`} />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {sectionRegistrations.map((registration) => (
                    <RegistrationCard
                      key={registration.id}
                      registration={registration}
                      dateAccent={registrations.indexOf(registration) % 4}
                      onConfirm={() => setPendingAction({ registration, action: "confirm" })}
                      onCancel={() => setPendingAction({ registration, action: "cancel" })}
                      actionFeedback={
                        actionFeedback?.registration.id === registration.id
                          ? actionFeedback
                          : null
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {pendingAction && (
        <RegistrationActionDialog
          action={pendingAction.action}
          registrationTitle={pendingAction.registration.title}
          onDismiss={() => setPendingAction(null)}
          onApprove={finishDemoAction}
          isSubmitting={isSubmittingAction}
        />
      )}
    </main>
  );
}
