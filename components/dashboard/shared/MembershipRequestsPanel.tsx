"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { API_ENABLED } from "@/lib/api/client";
import {
  decideMembershipRequest,
  fetchMembershipRequests,
  type MembershipDecision,
  type MembershipRequest,
} from "@/lib/membership-requests/api";
import { leaderCommitteeConfig } from "./committee-config";
import { useLeaderDashboard } from "./LeaderDashboardContext";

function decisionOrder(status: MembershipDecision) {
  return status === "PENDING" ? 0 : status === "APPROVED" ? 1 : 2;
}

export function MembershipRequestsPanel() {
  const t = useTranslations("dashboard.membershipRequests");
  const locale = useLocale();
  const { committee } = useLeaderDashboard();
  const committeeCode = leaderCommitteeConfig[committee].committeeCode;
  const [items, setItems] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchMembershipRequests(committeeCode).then((result) => {
      if (!active) return;
      if (result.ok) {
        setItems(result.data);
        setLoadError("");
      } else {
        setLoadError(
          result.status === 401
            ? "unauthorized"
            : result.status === 403
              ? "forbidden"
              : result.code === "API_DISABLED"
                ? "apiDisabled"
                : "loadError",
        );
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [committeeCode]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => {
      const aStatus = a.committeeDecision?.status ?? "PENDING";
      const bStatus = b.committeeDecision?.status ?? "PENDING";
      return decisionOrder(aStatus) - decisionOrder(bStatus)
        || new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }),
    [items],
  );

  async function decide(item: MembershipRequest, decision: "APPROVED" | "REJECTED") {
    if (savingId !== null || item.committeeDecision?.status !== "PENDING") return;
    setSavingId(item.id);
    setActionError("");
    const result = await decideMembershipRequest(item.id, committeeCode, decision);
    if (result.ok) {
      setItems((current) => current.map((request) => request.id === item.id ? result.data : request));
    } else {
      setActionError(result.status === 401 ? "unauthorized" : result.status === 403 ? "forbidden" : "decisionError");
      if (result.status === 409) {
        const fresh = await fetchMembershipRequests(committeeCode);
        if (fresh.ok) setItems(fresh.data);
      }
    }
    setSavingId(null);
  }

  function statusBadge(status: MembershipDecision) {
    const colors = status === "PENDING"
      ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
      : status === "APPROVED"
        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"
        : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200";
    return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${colors}`}>{t(`status.${status}`)}</span>;
  }

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-2xs" aria-labelledby="membership-requests-heading">
      <header className="border-b border-border/80 p-5">
        <h2 id="membership-requests-heading" className="text-base font-bold text-foreground">{t("title")}</h2>
        <p className="mt-1 text-xs text-muted">{t("description")}</p>
      </header>

      {actionError && <p role="alert" className="mx-5 mt-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{t(actionError)}</p>}
      <div className="space-y-4 p-5">
        {!API_ENABLED ? (
          <p className="rounded-lg border border-border p-4 text-sm text-muted">{t("apiDisabled")}</p>
        ) : loading ? (
          <p role="status" className="text-sm text-muted">{t("loading")}</p>
        ) : loadError ? (
          <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{t(loadError)}</p>
        ) : sortedItems.length === 0 ? (
          <p className="rounded-lg border border-border p-4 text-sm text-muted">{t("empty")}</p>
        ) : sortedItems.map((item) => {
          const ownDecision = item.committeeDecision?.status ?? "PENDING";
          const details = item.applicant.details;
          return (
            <article key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{item.applicant.fullName}</h3>
                  <p className="mt-1 text-xs text-muted">{t("submitted", { date: new Date(item.submittedAt).toLocaleDateString(locale) })}</p>
                </div>
                {statusBadge(ownDecision)}
              </div>

              <dl className="mt-4 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {([
                  ["email", item.applicant.email],
                  ["phone", details.phoneNumber],
                  ["universityEmail", item.applicant.universityEmail],
                  ["university", details.university],
                  ["branch", details.branch],
                  ["college", details.college],
                  ["major", details.major],
                  ["level", details.level],
                  ["gender", details.gender],
                ] as const).filter(([, value]) => Boolean(value)).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted">{t(`fields.${label}`)}</dt>
                    <dd className="mt-0.5 break-words font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 border-t border-border/70 pt-3">
                <h4 className="text-xs font-semibold text-foreground">{t("selectedCommittees")}</h4>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {item.committees.map((selected) => (
                    <li key={selected.code} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs">
                      <span className="font-medium text-foreground">{selected.name}</span>
                      {statusBadge(selected.status)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">{t("requestedRole", { role: item.committeeDecision?.requestedRole ?? "Member" })}</p>
              </div>

              {ownDecision === "PENDING" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={savingId !== null} onClick={() => void decide(item, "APPROVED")} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {savingId === item.id ? t("saving") : t("approve")}
                  </button>
                  <button type="button" disabled={savingId !== null} onClick={() => void decide(item, "REJECTED")} className="rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30">
                    {savingId === item.id ? t("saving") : t("reject")}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
