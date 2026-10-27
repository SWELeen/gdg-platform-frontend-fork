"use client";

import { useId, useState } from "react";
import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { LayoutGrid, List } from "lucide-react";

import { MembersTasksBoard } from "@/components/dashboard/members/MembersTasksBoard";
import { MembersTasksList } from "@/components/dashboard/members/MembersTasksList";
import { TaskProgress } from "@/components/dashboard/members/TaskProgress";
import { DASHBOARD_CARD } from "@/components/dashboard/members/card-styles";
import { priorityKeys } from "@/components/dashboard/members/task-styles";
import { useMemberWorkspace } from "@/components/dashboard/members/MemberWorkspaceContext";
import type { TaskPriority } from "@/components/dashboard/mock-data";

type PriorityFilter = "all" | TaskPriority;
type TasksView = "board" | "list";

const priorityOptions = Object.keys(priorityKeys) as TaskPriority[];

function viewButtonClass(active: boolean): string {
  return `rounded-lg p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30 ${
    active ? "bg-surface font-semibold text-foreground shadow-2xs" : "text-muted hover:text-foreground"
  }`;
}

// Read-only: the controls only change what is displayed, never the tasks themselves.
export function MembersTasksPage(): ReactElement {
  const t = useTranslations("dashboard.tasks");
  const selectId = useId();
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [view, setView] = useState<TasksView>("board");
  const { tasks } = useMemberWorkspace();

  const visibleTasks =
    priority === "all" ? tasks : tasks.filter((task) => task.priority === priority);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-foreground">
          {t("filterWithCount", { label: t("title"), count: tasks.length })}
        </h2>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor={selectId} className="sr-only">
              {t("priorityFilterLabel")}
            </label>
            <select
              id={selectId}
              value={priority}
              onChange={(event) => setPriority(event.target.value as PriorityFilter)}
              className="h-9 min-w-0 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground focus-visible:border-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
            >
              <option value="all">{t("allPriorities")}</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`priority.${priorityKeys[option]}`)}
                </option>
              ))}
            </select>

            <div
              role="group"
              aria-label={t("viewToggleLabel")}
              className="flex items-center rounded-xl border border-border bg-surface-muted/50 p-0.5"
            >
              <button
                type="button"
                aria-pressed={view === "board"}
                aria-label={t("boardView")}
                title={t("boardView")}
                onClick={() => setView("board")}
                className={viewButtonClass(view === "board")}
              >
                <LayoutGrid aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                aria-label={t("listView")}
                title={t("listView")}
                onClick={() => setView("list")}
                className={viewButtonClass(view === "list")}
              >
                <List aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className={DASHBOARD_CARD}>
          <TaskProgress tasks={tasks} />
        </div>
      )}

      {tasks.length > 0 && visibleTasks.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center text-sm text-muted"
        >
          {t("empty")}
        </div>
      ) : view === "board" || tasks.length === 0 ? (
        <MembersTasksBoard tasks={visibleTasks} />
      ) : (
        <MembersTasksList tasks={visibleTasks} />
      )}
    </div>
  );
}
