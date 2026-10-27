"use client";

import { useLeaderDashboard } from "./LeaderDashboardContext";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckSquare } from "lucide-react";
import { leaderCommitteeConfig } from "./committee-config";

export function TasksPreview() {
  const { tasks, committee } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader");
  const tasksPath = `${leaderCommitteeConfig[committee].routeBase}/tasks`;

  const previewTasks = tasks.slice(0, 4);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "High":
        return <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">{t("tasksPreview.high")}</span>;
      case "Medium":
        return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">{t("tasksPreview.medium")}</span>;
      default:
        return <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">{t("tasksPreview.low")}</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "Completed":
        return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("tasksPreview.completed")}</span>;
      case "In Progress":
        return <span className="text-blue-600 dark:text-blue-400 font-semibold">{t("tasksPreview.inProgress")}</span>;
      case "Pending Review":
        return <span className="text-violet-600 dark:text-violet-400 font-semibold">{t("tasksPreview.pendingReview")}</span>;
      default:
        return <span className="text-slate-500 font-semibold">{t("tasksPreview.toDo")}</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t("tasksPreview.title")}
          </h2>
          <p className="text-xs text-muted">
            {t("tasksPreview.description")}
          </p>
        </div>
        <Link
          href={tasksPath}
          className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("tasksPreview.viewAll")}
        </Link>
      </div>

      <div className="mt-3 divide-y divide-border/60">
        {previewTasks.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted">{t("tasksPreview.empty")}</p>
        ) : previewTasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2.5">
              <CheckSquare className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <div>
                <span className="block text-xs font-bold text-foreground">
                  {task.title}
                </span>
                <span className="block text-[11px] text-muted">
                  {t("tasksPreview.assignedTo")} <strong>{task.assignedMemberName}</strong> ? {t("tasksPreview.due")} {task.dueDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {getPriorityBadge(task.priority)}
              <span className="text-[11px]">{getStatusBadge(task.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
