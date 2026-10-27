"use client";

import { useState, type ReactElement } from "react";
import { useTranslations } from "next-intl";

import type { DashboardTask } from "@/components/dashboard/mock-data";
import type { MemberSettableStatus } from "@/lib/member-dashboard/api";
import { useMemberWorkspace } from "./MemberWorkspaceContext";

/**
 * Lets members move their own task. Choosing "done" only asks the committee leader to confirm;
 * a confirmed task can no longer be changed.
 */
export function MemberTaskStatusControl({ task }: { task: DashboardTask }): ReactElement | null {
  const t = useTranslations("dashboard.tasks");
  const { updateTaskStatus } = useMemberWorkspace();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!updateTaskStatus || task.status === "Complete") return null;

  const options: { value: MemberSettableStatus; label: string }[] = [
    { value: "To Do", label: t("status.toDo") },
    { value: "In Progress", label: t("status.inProgress") },
    { value: "Pending Review", label: task.status === "Pending Review" ? t("status.pendingReview") : t("actions.markDone") },
  ];

  const change = async (next: MemberSettableStatus) => {
    if (next === task.status) return;
    setSaving(true);
    setError("");
    try {
      await updateTaskStatus(task.id, next);
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : t("actions.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-1">
      <select
        value={task.status}
        disabled={saving}
        onChange={(event) => void change(event.target.value as MemberSettableStatus)}
        aria-label={t("actions.changeStatus", { title: task.title })}
        className="w-full cursor-pointer rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground outline-none focus:border-blue-500 disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {task.status === "Pending Review" && <p className="text-[11px] text-muted">{t("actions.waitingForLeader")}</p>}
      {error && (
        <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
