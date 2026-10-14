"use client";

import { useId } from "react";
import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Calendar, CheckCircle2, Clock, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { TaskDoneMark } from "@/components/dashboard/members/TaskDoneMark";
import {
  priorityKeys,
  priorityStyles,
  statusKeys,
  statusTones,
  toneColors,
  toneText,
} from "@/components/dashboard/members/task-styles";
import type { DashboardTask, TaskPriority, TaskStatus } from "@/components/dashboard/mock-data";

// Start-edge accent in the priority's tone, so urgency is visible before reading the badge.
const priorityAccents: Record<TaskPriority, string> = {
  High: "border-s-[var(--dashboard-red-text)]",
  Medium: "border-s-[var(--dashboard-yellow-text)]",
  Low: "border-s-[var(--dashboard-green-text)]",
};

const columns: { status: TaskStatus; Icon: LucideIcon }[] = [
  { status: "To Do", Icon: ListTodo },
  { status: "In Progress", Icon: Clock },
  { status: "Complete", Icon: CheckCircle2 },
];

function TaskCard({ task }: { task: DashboardTask }): ReactElement {
  const t = useTranslations("dashboard.tasks");
  const done = task.status === "Complete";

  return (
    <li
      className={`rounded-xl border border-s-4 border-border bg-surface p-4 shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        priorityAccents[task.priority]
      } ${done ? "opacity-80" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4
          className={`min-w-0 text-sm font-semibold leading-snug text-foreground ${done ? "line-through decoration-muted" : ""}`}
        >
          {task.title}
        </h4>
        <TaskBadge className={`shrink-0 ${priorityStyles[task.priority]}`}>
          {t(`priority.${priorityKeys[task.priority]}`)}
        </TaskBadge>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted">{task.description}</p>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs text-muted">
        <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
        <span>{t("columns.deadline")}</span>
        <span className="font-semibold text-foreground">{task.deadline}</span>
        {done && (
          <span className="ms-auto">
            <TaskDoneMark />
          </span>
        )}
      </div>
    </li>
  );
}

function BoardColumn({
  status,
  Icon,
  tasks,
}: {
  status: TaskStatus;
  Icon: LucideIcon;
  tasks: DashboardTask[];
}): ReactElement {
  const t = useTranslations("dashboard.tasks");
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col rounded-2xl bg-surface-muted/40 p-4 ring-1 ring-border"
    >
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Icon aria-hidden="true" className={`size-4 ${toneText[statusTones[status]]}`} />
          <h3 id={headingId} className="text-xs font-bold uppercase tracking-wider text-foreground">
            {t(`status.${statusKeys[status]}`)}
          </h3>
        </div>
        <span
          className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${toneColors[statusTones[status]]}`}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted">
          {t("board.emptyColumn")}
        </p>
      ) : (
        <ul className="mt-3 flex-1 space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}

// Read-only: members can see their own tasks but cannot create, edit, delete or move them.
export function MembersTasksBoard({ tasks }: { tasks: DashboardTask[] }): ReactElement {
  const t = useTranslations("dashboard.tasks");

  if (tasks.length === 0) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center text-sm text-muted"
      >
        {t("board.emptyList")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {columns.map(({ status, Icon }) => (
        <BoardColumn
          key={status}
          status={status}
          Icon={Icon}
          tasks={tasks.filter((task) => task.status === status)}
        />
      ))}
    </div>
  );
}
