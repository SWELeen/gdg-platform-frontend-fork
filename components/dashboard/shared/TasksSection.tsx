"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import type { CommitteeTask, TaskPriority, TaskStatus } from "./types";
import { ConfirmModal } from "./ConfirmModal";
import { ALL, CommitteeFilterSelect, CommitteeTag } from "./ClubFilters";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";

interface TasksSectionProps {
  onOpenCreateTask: () => void;
  onEditTask: (task: CommitteeTask) => void;
}

const taskStatusKeys: Record<TaskStatus, string> = {
  "To Do": "tasks.toDo",
  "In Progress": "tasks.inProgress",
  "Pending Review": "tasks.pendingReview",
  Completed: "tasks.complete",
};

export function TasksSection({
  onOpenCreateTask,
  onEditTask,
}: TasksSectionProps) {
  const { tasks, updateTask, deleteTask, canManageTasks, clubLeadership } =
    useLeaderDashboard();
  const t = useTranslations("dashboard.leader");

  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCommittee, setFilterCommittee] = useState(ALL);
  const [taskToDelete, setTaskToDelete] = useState<CommitteeTask | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const pendingReviewTasks = tasks.filter((task) => task.status === "Pending Review");

  const review = async (task: CommitteeTask, decision: "APPROVE" | "RETURN") => {
    setReviewing(task.id);
    setReviewError("");
    try {
      await reviewTask(task.id, decision);
    } catch (error) {
      setReviewError(error instanceof Error && error.message ? error.message : t("tasks.reviewFailed"));
    } finally {
      setReviewing(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterCommittee !== ALL && t.committeeCode !== filterCommittee) return false;
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "To Do");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "In Progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "Completed");

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case "High":
        return (
          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            {t("tasks.high")}
          </span>
        );
      case "Medium":
        return (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            {t("tasks.medium")}
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            {t("tasks.low")}
          </span>
        );
    }
  };

  const handleStatusChange = async (task: CommitteeTask, newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus }).catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t("tasks.managementTitle", { count: tasks.length })}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {clubLeadership && <CommitteeFilterSelect value={filterCommittee} onChange={setFilterCommittee} />}

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">{t("tasks.priorityAll")}</option>
            <option value="High">{t("tasks.high")}</option>
            <option value="Medium">{t("tasks.medium")}</option>
            <option value="Low">{t("tasks.low")}</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-border bg-surface-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "board"
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
              title={t("tasks.boardView")}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "table"
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
              title={t("tasks.tableView")}
            >
              <List className="size-4" />
            </button>
          </div>

          {canManageTasks && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="size-4" />
              <span>{t("tasks.add")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tasks members marked done, waiting for a leader to confirm them */}
      {pendingReviewTasks.length > 0 && (
        <section
          aria-labelledby="tasks-pending-review"
          className="rounded-2xl border border-violet-300 bg-violet-50/60 p-4 dark:border-violet-800/60 dark:bg-violet-950/20"
        >
          <h3 id="tasks-pending-review" className="text-sm font-bold text-foreground">
            {t("tasks.pendingReviewTitle", { count: pendingReviewTasks.length })}
          </h3>
          <p className="mt-1 text-xs text-muted">{t("tasks.pendingReviewHelp")}</p>
          {reviewError && (
            <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{reviewError}</p>
          )}
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {pendingReviewTasks.map((task) => (
              <li key={task.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                  <p className="text-[11px] text-muted">{task.assignedMemberName}</p>
                </div>
                {canManageTasks && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={reviewing === task.id}
                      onClick={() => void review(task, "APPROVE")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="size-3.5" />
                      {t("tasks.confirmDone")}
                    </button>
                    <button
                      type="button"
                      disabled={reviewing === task.id}
                      onClick={() => void review(task, "RETURN")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted disabled:opacity-60"
                    >
                      {t("tasks.returnToMember")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Notion-Style Kanban Board View */}
      {viewMode === "board" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Column: To Do */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface-muted/30 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <ListTodo className="size-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  To Do
                </h3>
              </div>
              <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {todoTasks.length}
              </span>
            </div>

            <div className="mt-3 flex-1 space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-border bg-surface p-4 shadow-2xs transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground leading-snug">
                      {task.title}
                    </h4>
                    {getPriorityBadge(task.priority)}
                  </div>

                  {task.description && (
                    <p className="mt-1 text-[11px] text-muted line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      {task.assignedMemberName}
                      {clubLeadership && <CommitteeTag code={task.committeeCode} name={task.committeeName} />}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {task.dueDate}
                    </span>
                  </div>

                  {canManageTasks && (
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className="rounded-lg border border-border bg-surface-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground outline-none"
                      >
                        <option value="To Do">{t("tasks.toDo")}</option>
                        <option value="In Progress">{t("tasks.moveToInProgress")}</option>
                        <option value="Completed">{t("tasks.moveToCompleted")}</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="rounded p-1 text-muted hover:text-foreground"
                          title={t("tasks.edit")}
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="rounded p-1 text-muted hover:text-rose-600"
                          title={t("tasks.delete")}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface-muted/30 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  In Progress
                </h3>
              </div>
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="mt-3 flex-1 space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-border bg-surface p-4 shadow-2xs transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground leading-snug">
                      {task.title}
                    </h4>
                    {getPriorityBadge(task.priority)}
                  </div>

                  {task.description && (
                    <p className="mt-1 text-[11px] text-muted line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      {task.assignedMemberName}
                      {clubLeadership && <CommitteeTag code={task.committeeCode} name={task.committeeName} />}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {task.dueDate}
                    </span>
                  </div>

                  {canManageTasks && (
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className="rounded-lg border border-border bg-surface-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground outline-none"
                      >
                        <option value="In Progress">{t("tasks.inProgress")}</option>
                        <option value="To Do">{t("tasks.moveToTodo")}</option>
                        <option value="Completed">{t("tasks.moveToCompleted")}</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="rounded p-1 text-muted hover:text-foreground"
                          title={t("tasks.edit")}
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="rounded p-1 text-muted hover:text-rose-600"
                          title={t("tasks.delete")}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface-muted/30 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Completed
                </h3>
              </div>
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                {completedTasks.length}
              </span>
            </div>

            <div className="mt-3 flex-1 space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-border bg-surface/80 p-4 shadow-2xs opacity-80 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground line-through decoration-muted">
                      {task.title}
                    </h4>
                    {getPriorityBadge(task.priority)}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      {task.assignedMemberName}
                      {clubLeadership && <CommitteeTag code={task.committeeCode} name={task.committeeName} />}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      ✓ Done
                    </span>
                  </div>

                  {canManageTasks && (
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className="rounded-lg border border-border bg-surface-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground outline-none"
                      >
                        <option value="Completed">{t("tasks.complete")}</option>
                        <option value="In Progress">{t("tasks.moveToInProgress")}</option>
                        <option value="To Do">{t("tasks.moveToTodo")}</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="rounded p-1 text-muted hover:text-rose-600"
                          title={t("tasks.delete")}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-border bg-surface overflow-x-auto shadow-2xs">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5 text-start">{t("tasks.task")}</th>
                {clubLeadership && <th className="px-4 py-3.5 text-start">{t("clubFilters.committee")}</th>}
                <th className="px-4 py-3.5 text-start">{t("tasks.assignedTo")}</th>
                <th className="px-4 py-3.5 text-start">{t("tasks.dueDate")}</th>
                <th className="px-4 py-3.5 text-start">{t("tasks.priority")}</th>
                <th className="px-4 py-3.5 text-start">{t("tasks.status")}</th>
                <th className="px-5 py-3.5 text-end">{t("tasks.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="transition hover:bg-surface-muted/20">
                  <td className="px-5 py-3.5 font-bold text-foreground">
                    {task.title}
                  </td>
                  {clubLeadership && <td className="px-4 py-3.5"><CommitteeTag code={task.committeeCode} name={task.committeeName} /></td>}
                  <td className="px-4 py-3.5 text-muted">{task.assignedMemberName}</td>
                  <td className="px-4 py-3.5 text-muted">{task.dueDate}</td>
                  <td className="px-4 py-3.5">{getPriorityBadge(task.priority)}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground/80">{t(taskStatusKeys[task.status])}</td>
                  <td className="px-5 py-3.5 text-end">
                    {canManageTasks && (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="rounded p-1 text-muted hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="rounded p-1 text-muted hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
          }
        }}
        title={t("tasks.deleteTitle")}
        message={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{taskToDelete?.title}</strong>? This
            will remove it from the committee board.
          </>
        }
        confirmText={t("tasks.deleteConfirm")}
        cancelText={t("tasks.cancel")}
        danger
      />
    </div>
  );
}
