"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { decideLeadershipApplication, fetchLeadershipApplications, type LeadershipApplication } from "@/lib/membership-requests/api";

// A failed decision explains itself instead of reading as a failed load.
function decisionErrorKey(status: number) {
  if (status === 403) return "notAllowed";
  if (status === 404 || status === 409) return "alreadyHandled";
  return "decisionFailed";
}

export function LeadershipApprovalsPanel({ scope }: { scope: "CLUB" | "DEVELOPER_COMMITTEES" }) {
  const t = useTranslations("dashboard.leadershipApprovals");
  const [items, setItems] = useState<LeadershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchLeadershipApplications(scope);
    if (result.ok) setItems(result.data);
    setLoadFailed(!result.ok);
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    queueMicrotask(() => { void load(); });
  }, [load]);

  async function decide(item: LeadershipApplication, decision: "APPROVED" | "REJECTED") {
    setBusyId(item.id);
    setDecisionError("");
    const result = await decideLeadershipApplication(item, decision);
    if (!result.ok) setDecisionError(decisionErrorKey(result.status));
    // Refresh either way: a request someone else already handled drops off the list.
    await load();
    setBusyId(null);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-2xs" aria-labelledby="leadership-approvals-title">
      <h2 id="leadership-approvals-title" className="text-lg font-bold">{t("title")}</h2>
      {loading && <p className="mt-4 text-sm text-foreground/60" aria-live="polite">{t("loading")}</p>}
      {!loading && loadFailed && <p className="mt-4 text-sm text-gdg-red" role="alert">{t("error")}</p>}
      {decisionError && <p className="mt-4 text-sm text-gdg-red" role="alert">{t(decisionError)}</p>}
      {!loading && !loadFailed && items.length === 0 && <p className="mt-4 text-sm text-foreground/60">{t("empty")}</p>}
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <article key={`${item.id}-${item.type}-${item.committee?.committeeCode ?? item.role?.roleCode ?? index}`} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.applicant.fullName}</h3>
                <p className="text-sm text-foreground/65">{item.applicant.email}</p>
                <p className="mt-2 text-sm">{item.type === "GLOBAL_ROLE" ? item.role?.roleCode : `${item.committee?.committeeName}: ${item.requestedRole}`}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busyId === item.id} onClick={() => void decide(item, "REJECTED")} className="rounded-md border border-foreground/20 px-3 py-2 text-sm disabled:opacity-50">{t("reject")}</button>
                <button type="button" disabled={busyId === item.id} onClick={() => void decide(item, "APPROVED")} className="rounded-md bg-gdg-blue px-3 py-2 text-sm text-white disabled:opacity-50">{t("approve")}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
