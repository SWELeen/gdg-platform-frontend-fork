"use client";

import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";

export function LeaderDashboardStatus() {
  const t = useTranslations("dashboard.leader.dataState");
  const { dashboardLoading, dashboardError, reloadDashboard } = useLeaderDashboard();

  if (dashboardLoading) {
    return <p role="status" className="mb-5 rounded-xl border border-border bg-surface p-4 text-sm text-muted">{t("loading")}</p>;
  }
  if (!dashboardError) return null;

  const message = dashboardError === "UNAUTHORIZED"
    ? t("unauthorized")
    : dashboardError === "FORBIDDEN"
      ? t("forbidden")
      : t("failed");
  return (
    <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
      <span>{message}</span>
      <button type="button" onClick={() => void reloadDashboard()} className="rounded-lg border border-current px-3 py-1.5 font-semibold">{t("retry")}</button>
    </div>
  );
}
