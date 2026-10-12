"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { TaskDoneMark } from "@/components/dashboard/members/TaskDoneMark";
import {
  priorityKeys,
  priorityStyles,
  statusKeys,
  statusStyles,
} from "@/components/dashboard/members/task-styles";
import type { DashboardTask } from "@/components/dashboard/mock-data";

// Read-only list view: a table from md up, cards below it (same switch as the home tasks panel).
export function MembersTasksList({ tasks }: { tasks: DashboardTask[] }): ReactElement {
  const t = useTranslations("dashboard.tasks");

  return (
    <div className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-gdg-gray-light sm:p-4 lg:p-5">
      <div className="hidden overflow-x-hidden md:block">
        <table className="w-full table-fixed border-collapse text-start text-sm">
          <colgroup>
            <col className="w-[46%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr className="bg-surface-muted/60 text-start text-xs font-medium uppercase tracking-wide text-muted">
              <th scope="col" className="rounded-s-lg py-2 ps-3 text-start">
                {t("columns.task")}
              </th>
              <th scope="col" className="py-2 text-start">
                {t("columns.deadline")}
              </th>
              <th scope="col" className="py-2 text-start">
                {t("columns.priority")}
              </th>
              <th scope="col" className="rounded-e-lg py-2 pe-3 text-start">
                {t("columns.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const done = task.status === "Complete";
              return (
                <tr
                  key={task.id}
                  className={`border-b border-border last:border-0 ${done ? "opacity-80" : ""}`}
                >
                  <td className="py-2.5 ps-3 pe-4">
                    <div className="flex items-center gap-2">
                      <p
                        className={`min-w-0 truncate text-sm font-medium text-foreground ${
                          done ? "line-through decoration-muted" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {done && <TaskDoneMark />}
                    </div>
                    <p className="truncate text-xs text-muted">{task.description}</p>
                  </td>
                  <td className="py-2.5 pe-4 text-foreground/70">{task.deadline}</td>
                  <td className="py-2.5 pe-4">
                    <TaskBadge className={priorityStyles[task.priority]}>
                      {t(`priority.${priorityKeys[task.priority]}`)}
                    </TaskBadge>
                  </td>
                  <td className="py-2.5 pe-3">
                    <TaskBadge className={statusStyles[task.status]}>
                      {t(`status.${statusKeys[task.status]}`)}
                    </TaskBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 md:hidden">
        {tasks.map((task) => {
          const done = task.status === "Complete";
          return (
            <li
              key={task.id}
              className={`rounded-xl border border-border p-2.5 ${done ? "opacity-80" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`min-w-0 truncate text-sm font-medium text-foreground ${
                    done ? "line-through decoration-muted" : ""
                  }`}
                >
                  {task.title}
                </p>
                {done && <TaskDoneMark />}
              </div>
              <p className="mt-0.5 text-xs text-muted">{task.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">{task.deadline}</span>
                <TaskBadge className={priorityStyles[task.priority]}>
                  {t(`priority.${priorityKeys[task.priority]}`)}
                </TaskBadge>
                <TaskBadge className={statusStyles[task.status]}>
                  {t(`status.${statusKeys[task.status]}`)}
                </TaskBadge>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
