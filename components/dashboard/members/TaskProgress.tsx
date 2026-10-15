"use client";

import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import type { DashboardTask } from "@/components/dashboard/mock-data";

// Completion summary for a set of tasks: "1 of 3 completed" plus an animated bar.
export function TaskProgress({ tasks, className = "" }: { tasks: DashboardTask[]; className?: string }): ReactElement | null {
  const t = useTranslations("dashboard.tasks");

  if (tasks.length === 0) return null;

  const done = tasks.filter((task) => task.status === "Complete").length;
  const percent = Math.round((done / tasks.length) * 100);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        role="progressbar"
        aria-label={t("progressLabel")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-muted"
      >
        <motion.div
          className="h-full rounded-full bg-gdg-green"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <p className="shrink-0 text-xs font-medium text-muted">
        {t("progress", { done, total: tasks.length })}
        <span className="ms-1.5 font-semibold text-foreground">{percent}%</span>
      </p>
    </div>
  );
}
