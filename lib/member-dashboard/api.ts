import { apiRequest } from "@/lib/api/client";
import type { DashboardTask, TaskStatus } from "@/components/dashboard/mock-data";

export interface MemberCommittee {
  code: string;
  name: string;
  position: string;
}

export interface MemberIdentity {
  fullName: string;
  committees: MemberCommittee[];
}

/** A task assigned to the signed-in member, labelled with its committee. */
export interface MemberTask extends DashboardTask {
  committeeCode: string;
  committeeName: string;
}

type ApiMyTask = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  priority: string;
  status: string;
  committeeCode: string;
  committeeName: string;
};

const STATUS_FROM_API: Record<string, TaskStatus> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  PENDING_REVIEW: "Pending Review",
  COMPLETED: "Complete",
};

/** Statuses a member may choose; "Complete" only comes from a leader's confirmation. */
export const STATUS_TO_API = {
  "To Do": "TODO",
  "In Progress": "IN_PROGRESS",
  "Pending Review": "PENDING_REVIEW",
} as const;
export type MemberSettableStatus = keyof typeof STATUS_TO_API;

const deadline = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Riyadh", month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

export function fetchMemberIdentity() {
  return apiRequest<MemberIdentity>("/me");
}

function toMemberTask(task: ApiMyTask): MemberTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    deadline: deadline(task.dueAt),
    priority: task.priority === "HIGH" ? "High" : task.priority === "LOW" ? "Low" : "Medium",
    status: STATUS_FROM_API[task.status] ?? "To Do",
    committeeCode: task.committeeCode,
    committeeName: task.committeeName,
  };
}

export async function fetchMyTasks() {
  const result = await apiRequest<ApiMyTask[]>("/my/tasks");
  if (!result.ok) return result;
  return { ok: true as const, data: result.data.map(toMemberTask) };
}

/** Moves the member's own task; marking it done sends it to a leader for confirmation. */
export async function updateMyTaskStatus(taskId: string, status: MemberSettableStatus) {
  const result = await apiRequest<ApiMyTask>(`/my/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: { status: STATUS_TO_API[status] },
  });
  if (!result.ok) return result;
  return { ok: true as const, data: toMemberTask(result.data) };
}
