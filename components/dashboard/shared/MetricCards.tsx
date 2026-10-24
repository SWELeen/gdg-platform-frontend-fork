"use client";

import { useLeaderDashboard } from "./LeaderDashboardContext";
import { useTranslations } from "next-intl";
import { leaderCommitteeConfig } from "./committee-config";
import { Users, Calendar, Trophy, CheckSquare, CalendarCheck, ClipboardList, CircleCheck, CircleX } from "lucide-react";

export function MetricCards() {
  const { stats, committee, dashboardLoading, dashboardError } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader");
  const isPr = leaderCommitteeConfig[committee].overviewMode === "registration-management";
  const unavailable = dashboardLoading || dashboardError !== null;
  const metrics = isPr
    ? [
        { label: t("metrics.committeeMembers"), value: unavailable ? "—" : stats.committeeMembers, detail: unavailable ? "—" : t("metrics.active", { count: stats.activeMembers }), icon: Users, border: "border-gdg-blue", style: "bg-blue-50 text-gdg-blue dark:bg-blue-950/50" },
        { label: t("metrics.upcomingEvents"), value: unavailable ? "—" : stats.upcomingEvents, detail: t("metrics.availableForReview"), icon: Calendar, border: "border-gdg-red", style: "bg-red-50 text-gdg-red dark:bg-red-950/50" },
        { label: t("metrics.pendingRegistrations"), value: unavailable ? "—" : stats.pendingRegistrations, detail: t("metrics.awaitingReview"), icon: ClipboardList, border: "border-gdg-yellow", style: "bg-amber-50 text-gdg-yellow dark:bg-amber-950/50" },
        { label: t("metrics.acceptedRegistrations"), value: unavailable ? "—" : stats.acceptedRegistrations, detail: t("metrics.acceptedApplicants"), icon: CircleCheck, border: "border-gdg-green", style: "bg-emerald-50 text-gdg-green dark:bg-emerald-950/50" },
        { label: t("metrics.rejectedRegistrations"), value: unavailable ? "—" : stats.rejectedRegistrations, detail: t("metrics.rejectedApplicants"), icon: CircleX, border: "border-gdg-blue", style: "bg-blue-50 text-blue-600 dark:bg-blue-950/50" },
      ]
    : [
        { label: t("metrics.totalCommitteeMembers"), value: unavailable ? "—" : stats.committeeMembers, detail: unavailable ? "—" : t("metrics.activeAway", { active: stats.activeMembers, away: stats.awayMembers }), icon: Users, border: "border-gdg-blue", style: "bg-blue-50 text-gdg-blue dark:bg-blue-950/50" },
        { label: t("metrics.upcomingEvents"), value: unavailable ? "—" : stats.upcomingEvents, detail: unavailable ? "—" : t("metrics.next30Days", { count: stats.upcomingEventsInNext30Days }), icon: Calendar, border: "border-gdg-red", style: "bg-red-50 text-gdg-red dark:bg-red-950/50" },
        { label: t("metrics.totalPoints"), value: unavailable ? "—" : stats.totalPoints.toLocaleString(), detail: unavailable ? "—" : t("metrics.thisMonth", { count: stats.pointsThisMonth.toLocaleString() }), icon: Trophy, border: "border-gdg-yellow", style: "bg-amber-50 text-gdg-yellow dark:bg-amber-950/50" },
        { label: t("metrics.activeTasks"), value: unavailable ? "—" : stats.activeTasks, detail: unavailable ? "—" : t("metrics.dueThisWeek", { count: stats.tasksDueThisWeek }), icon: CheckSquare, border: "border-gdg-green", style: "bg-emerald-50 text-gdg-green dark:bg-emerald-950/50" },
        { label: t("metrics.eventsCreated"), value: unavailable ? "—" : stats.eventsCreated, detail: unavailable ? "—" : t("metrics.publishedThisYear", { count: stats.eventsPublishedThisYear }), icon: CalendarCheck, border: "border-gdg-blue", style: "bg-blue-50 text-blue-600 dark:bg-blue-950/50" },
      ];
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
    {metrics.map(({ label, value, detail, icon: Icon, border, style }) => <div key={label} className={`rounded-2xl border-2 ${border} bg-surface p-4 shadow-2xs`}>
      <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-muted">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${style}`}><Icon className="size-4.5" /></span></div>
      <div className="mt-3"><span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</span><span className="mt-1 block text-xs text-muted">{detail}</span></div>
    </div>)}
  </div>;
}
