"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/dashboard/shared/ConfirmModal";
import {
  createLeadershipTask,
  createProjectEventTask,
  deleteLeadershipTask,
  deleteProjectEventTask,
  fetchClubLeadershipTasks,
  fetchDeveloperLeadershipTasks,
  fetchProjectManagedEvents,
  reviewLeadershipTask,
  reviewProjectEventTask,
  type CreateLeadershipTaskInput,
  type LeadershipTaskBoard,
  type LeadershipTaskTarget,
  type LeadershipWorkTask,
  type ProjectManagedEvent,
} from "@/lib/committee-dashboard/api";

type Mode = "club" | "developer" | "project-events";
type BoardData = LeadershipTaskBoard | { targets: LeadershipTaskTarget[]; events: ProjectManagedEvent[] };

function targetKey(target: LeadershipTaskTarget) {
  return `${target.committeeCode}:${target.memberId}`;
}

export function LeadershipTaskWorkspace({ mode }: { mode: Mode }) {
  const t = useTranslations("dashboard.leadershipTasks");
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<LeadershipWorkTask | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetId, setTargetId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<CreateLeadershipTaskInput["priority"]>("MEDIUM");

  const reload = useCallback(async () => {
    setError("");
    try {
      const result = mode === "club" ? await fetchClubLeadershipTasks()
        : mode === "developer" ? await fetchDeveloperLeadershipTasks()
          : await fetchProjectManagedEvents();
      if (!result.ok) throw new Error(result.message);
      setData(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [mode, t]);

  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);

  const isEventMode = mode === "project-events";
  const board = !isEventMode && data ? data as LeadershipTaskBoard : null;
  const events = isEventMode && data ? (data as { events: ProjectManagedEvent[] }).events : [];
  const targets = data ? data.targets : [];
  const selectedTarget = targets.find((target) => targetKey(target) === targetId);

  async function submit(event: FormEvent<HTMLFormElement>, eventId?: string) {
    event.preventDefault();
    if (!selectedTarget || !dueAt) return;
    setSaving(true);
    setError("");
    try {
      const input: CreateLeadershipTaskInput = {
        title: title.trim(), description: description.trim(), assignedMemberId: selectedTarget.memberId,
        targetCommitteeCode: selectedTarget.committeeCode, dueAt: new Date(dueAt).toISOString(), priority,
      };
      if (isEventMode) {
        if (!eventId) return;
        const result = await createProjectEventTask(eventId, input);
        if (!result.ok) throw new Error(result.message);
      } else {
        const result = await createLeadershipTask(mode, input);
        if (!result.ok) throw new Error(result.message);
      }
      setTitle(""); setDescription(""); setDueAt("");
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function review(task: LeadershipWorkTask, decision: "APPROVE" | "RETURN") {
    try {
      const result = isEventMode ? await reviewProjectEventTask(task.eventId!, task.id, decision)
        : await reviewLeadershipTask(mode, task.id, decision);
      if (!result.ok) throw new Error(result.message);
      await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("saveError")); }
  }

  async function remove(task: LeadershipWorkTask) {
    try {
      const result = isEventMode ? await deleteProjectEventTask(task.eventId!, task.id)
        : await deleteLeadershipTask(mode, task.id);
      if (!result.ok) throw new Error(result.message);
      setTaskToDelete(null);
      await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("saveError")); }
  }

  if (loading) return <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">{t("loading")}</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-foreground">{t(isEventMode ? "eventsTitle" : mode === "club" ? "clubTitle" : "developerTitle")}</h1>
        <p className="mt-1 text-sm text-muted">{t(isEventMode ? "eventsDescription" : "description")}</p>
      </header>
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {!isEventMode && mode === "developer" && Boolean(board?.inboxTasks?.length) && (
        <section className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <h2 className="font-semibold text-foreground">{t("incoming")}</h2>
          {(board?.inboxTasks ?? []).map((task) => <TaskCard key={task.id} task={task} t={t} />)}
        </section>
      )}

      {!isEventMode && board && board.canManageTasks !== false && (
        <form onSubmit={submit} className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <h2 className="sm:col-span-2 font-semibold text-foreground">{t("newTask")}</h2>
          <input required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("taskTitle")} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          <select required value={targetId} onChange={(e) => setTargetId(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
            <option value="">{t("assignee")}</option>
            {targets.map((target) => <option key={targetKey(target)} value={targetKey(target)}>{target.name} · {target.committeeName} · {target.role}</option>)}
          </select>
          <textarea maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("descriptionField")} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
          <label className="grid min-w-0 gap-1 text-xs text-muted">{t("dueDate")}<input required type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" /></label>
          <label className="grid min-w-0 gap-1 text-xs text-muted">{t("priority")}<select value={priority} onChange={(e) => setPriority(e.target.value as CreateLeadershipTaskInput["priority"])} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"><option value="HIGH">{t("high")}</option><option value="MEDIUM">{t("medium")}</option><option value="LOW">{t("low")}</option></select></label>
          <button disabled={saving || !targets.length} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{saving ? t("saving") : t("create")}</button>
          {!targets.length && <p className="text-sm text-muted sm:col-span-2">{t("noTargets")}</p>}
        </form>
      )}

      {isEventMode ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((event) => <section key={event.id} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
            <div><h2 className="font-bold text-foreground">{event.title}</h2><p className="text-xs text-muted">{new Date(event.startsAt).toLocaleString()}</p><p className="mt-1 text-sm text-muted">{event.location}</p></div>
            <form onSubmit={(e) => { setSelectedEvent(event.id); void submit(e, event.id); }} className="grid min-w-0 grid-cols-1 gap-2 rounded-xl bg-surface-muted/50 p-3">
              <input required maxLength={150} value={selectedEvent === event.id ? title : ""} onFocus={() => setSelectedEvent(event.id)} onChange={(e) => { setSelectedEvent(event.id); setTitle(e.target.value); }} placeholder={t("taskTitle")} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
              <select required value={selectedEvent === event.id ? targetId : ""} onFocus={() => setSelectedEvent(event.id)} onChange={(e) => { setSelectedEvent(event.id); setTargetId(e.target.value); }} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"><option value="">{t("assignee")}</option>{targets.map((target) => <option key={targetKey(target)} value={targetKey(target)}>{target.name} · {target.committeeName} · {target.role}</option>)}</select>
              <textarea maxLength={5000} value={selectedEvent === event.id ? description : ""} onFocus={() => setSelectedEvent(event.id)} onChange={(e) => { setSelectedEvent(event.id); setDescription(e.target.value); }} placeholder={t("descriptionField")} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
              <div className="grid min-w-0 grid-cols-2 gap-2"><input required type="datetime-local" value={selectedEvent === event.id ? dueAt : ""} onFocus={() => setSelectedEvent(event.id)} onChange={(e) => { setSelectedEvent(event.id); setDueAt(e.target.value); }} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs" /><select value={priority} onChange={(e) => setPriority(e.target.value as CreateLeadershipTaskInput["priority"])} className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm"><option value="HIGH">{t("high")}</option><option value="MEDIUM">{t("medium")}</option><option value="LOW">{t("low")}</option></select></div>
              <button disabled={saving || !targets.length} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? t("saving") : t("create")}</button>
              {!targets.length && <p className="text-xs text-muted">{t("noTargets")}</p>}
            </form>
            {event.tasks.length ? event.tasks.map((task) => <TaskCard key={task.id} task={task} t={t} onReview={(decision) => void review(task, decision)} onDelete={() => setTaskToDelete(task)} />) : <p className="text-sm text-muted">{t("emptyTasks")}</p>}
          </section>)}
          {!events.length && <p className="rounded-xl border border-border p-5 text-sm text-muted">{t("noEvents")}</p>}
        </div>
      ) : (
        <section className="space-y-3">
          {(board?.tasks ?? []).length ? board!.tasks.map((task) => <TaskCard key={task.id} task={task} t={t} onReview={(decision) => void review(task, decision)} onDelete={() => setTaskToDelete(task)} />) : <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">{t("emptyTasks")}</p>}
        </section>
      )}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => { if (taskToDelete) void remove(taskToDelete); }}
        title={t("deleteTitle")}
        message={t("deleteMessage", { title: taskToDelete?.title ?? "" })}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        danger
      />
    </div>
  );
}

function TaskCard({ task, t, onReview, onDelete }: { task: LeadershipWorkTask; t: (key: string) => string; onReview?: (decision: "APPROVE" | "RETURN") => void; onDelete?: () => void }) {
  const status = task.status === "TODO" ? t("toDo")
    : task.status === "IN_PROGRESS" ? t("inProgress")
      : task.status === "PENDING_REVIEW" ? t("pendingReview")
        : t("completed");
  return <article className="rounded-xl border border-border bg-surface p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-foreground">{task.title}</h3><p className="mt-1 text-xs text-muted">{task.assignedMemberName} · {task.committeeName}{task.eventTitle ? ` · ${task.eventTitle}` : ""}</p></div><span className="rounded-full bg-surface-muted px-2 py-1 text-xs text-foreground">{status}</span></div>
    {task.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{task.description}</p>}
    <p className="mt-2 text-xs text-muted">{t("dueDate")}: {new Date(task.dueAt).toLocaleString()}</p>
    {onReview && task.status === "PENDING_REVIEW" && <div className="mt-3 flex gap-2"><button onClick={() => onReview("APPROVE")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">{t("approve")}</button><button onClick={() => onReview("RETURN")} className="rounded-lg border border-border px-3 py-1.5 text-xs">{t("return")}</button></div>}
    {onDelete && <button onClick={onDelete} className="mt-3 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">{t("delete")}</button>}
  </article>;
}
