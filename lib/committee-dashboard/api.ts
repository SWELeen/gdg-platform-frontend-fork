import type {
  CommitteeEvent,
  CommitteeMember,
  CommitteeOption,
  CommitteeTask,
  EventType,
  LeaderDashboardSeed,
  PointHistoryItem,
  RecentActivityItem,
  TaskStatus,
} from "@/components/dashboard/shared/types";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { formatDate, formatTime } from "@/lib/events/api";
import { registrantFieldKeyByValue } from "@/components/dashboard/data-analysis/event-form-config";

export interface CommitteeDashboardStats {
  committeeMembers: number;
  activeMembers: number;
  awayMembers: number;
  upcomingEvents: number;
  upcomingEventsInNext30Days: number;
  totalPoints: number;
  pointsThisMonth: number;
  activeTasks: number;
  tasksDueThisWeek: number;
  eventsCreated: number;
  eventsPublishedThisYear: number;
  pendingRegistrations: number;
  acceptedRegistrations: number;
  rejectedRegistrations: number;
}

export interface DeveloperCommitteeOverview {
  code: string;
  name: string;
  memberCount: number;
  leaderCount: number;
  activeTaskCount: number;
}

export function fetchDeveloperCommitteeOverview() {
  return apiRequest<DeveloperCommitteeOverview[]>("/developer-committees/dashboard");
}

export interface CommitteeDashboardData extends LeaderDashboardSeed {
  committee: { id: number | null; code: string; name: string };
  currentMember: { id: string; name: string; role: string } | null;
  stats: CommitteeDashboardStats;
  permissions: {
    canManageTasks: boolean;
    canManagePoints: boolean;
    canManageRegistrations: boolean;
    canAddMembers: boolean;
    canCreateEvents?: boolean;
  };
  /** Club leadership only: every committee, for the filters. */
  committees?: CommitteeOption[];
}

type ApiMember = Omit<CommitteeMember, "isElevated" | "accessExpiresAt" | "initials" | "avatarBgColor" | "lastActivity"> & { lastActivity: string | null };
type ApiTask = {
  id: string; title: string; description: string; assignedMemberId: string;
  assignedMemberName: string; createdByMemberId: string; dueAt: string;
  priority: string; status: string; createdAt: string; updatedAt: string;
  committeeCode?: string; committeeName?: string;
};

type RawCommitteeDashboardData = Omit<CommitteeDashboardData, "members" | "events" | "tasks" | "pointHistory" | "recentActivities"> & {
  members: ApiMember[];
  events: { id: string; title: string; date: string; eventType?: string | null; endsAt: string; location: string | null; status: string; registered: number; confirmed: number; checkedIn: number; capacity: number; createdAt: string }[];
  tasks: ApiTask[];
  pointHistory: (Omit<PointHistoryItem, "timestamp"> & { createdAt: string })[];
  recentActivities: (Omit<RecentActivityItem, "timeAgo"> & { createdAt: string })[];
};

export async function fetchCommitteeDashboard(code: string): Promise<ApiResult<CommitteeDashboardData>> {
  const result = await apiRequest<RawCommitteeDashboardData>(`/committees/${encodeURIComponent(code)}/dashboard`);
  if (!result.ok) return result;
  return { ok: true, data: mapDashboardData(result.data) };
}

export async function fetchClubLeadershipDashboard(): Promise<ApiResult<CommitteeDashboardData>> {
  const result = await apiRequest<RawCommitteeDashboardData>("/club-leadership/dashboard");
  if (!result.ok) return result;
  return { ok: true, data: mapDashboardData(result.data) };
}

function mapDashboardData(data: RawCommitteeDashboardData): CommitteeDashboardData {
  const memberById = new Map(data.members.map((member) => [member.id, member]));
  return {
      ...data,
      members: data.members.map((member) => ({
        ...member,
        isElevated: false,
        accessExpiresAt: null,
        initials: member.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
        avatarBgColor: "bg-blue-100 text-blue-700",
        lastActivity: member.lastActivity ? relativeTime(member.lastActivity) : "—",
      })),
      events: data.events.map((event): CommitteeEvent => ({
        id: event.id,
        title: event.title,
        type: (event.eventType as EventType | null | undefined) ?? "Workshop",
        date: formatDate(event.date),
        time: formatTime(event.date),
        location: event.location ?? "",
        registered: event.registered,
        confirmed: event.confirmed,
        checkedIn: event.checkedIn,
        capacity: event.capacity,
        status: event.status === "PUBLISHED" && new Date(event.endsAt).getTime() < Date.now() ? "Completed" : event.status === "PUBLISHED" ? "Upcoming" : "Draft",
        created: relativeTime(event.createdAt),
        updated: relativeTime(event.createdAt),
      })),
      tasks: data.tasks.map((task): CommitteeTask => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedMemberId: task.assignedMemberId,
        assignedMemberName: memberById.get(task.assignedMemberId)?.name ?? task.assignedMemberName,
        createdBy: memberById.get(task.createdByMemberId)?.name ?? "",
        dueDate: task.dueAt,
        priority: task.priority === "HIGH" ? "High" : task.priority === "LOW" ? "Low" : "Medium",
        status: task.status === "COMPLETED" ? "Completed" : task.status === "IN_PROGRESS" ? "In Progress" : "To Do",
        committeeCode: task.committeeCode,
        committeeName: task.committeeName,
      })),
      pointHistory: data.pointHistory.map((item) => ({ ...item, timestamp: relativeTime(item.createdAt) })),
      recentActivities: data.recentActivities.map((item) => ({ ...item, timeAgo: relativeTime(item.createdAt) })),
    };
}

const TASK_STATUS_FROM_API: Record<string, TaskStatus> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  PENDING_REVIEW: "Pending Review",
  COMPLETED: "Completed",
};

const TASK_STATUS_TO_API: Record<TaskStatus, string> = {
  "To Do": "TODO",
  "In Progress": "IN_PROGRESS",
  "Pending Review": "PENDING_REVIEW",
  Completed: "COMPLETED",
};

/** Confirms a task a member marked done, or sends it back to In Progress. */
export function reviewCommitteeTask(code: string, taskId: string, decision: "APPROVE" | "RETURN") {
  return apiRequest(`/committees/${encodeURIComponent(code)}/tasks/${encodeURIComponent(taskId)}/review`, {
    method: "POST",
    body: { decision },
  });
}

export async function createCommitteeTask(code: string, task: Omit<CommitteeTask, "id">) {
  const response = await apiRequest(`/committees/${encodeURIComponent(code)}/tasks`, {
    method: "POST",
    body: {
      title: task.title,
      description: task.description,
      assignedMemberId: Number(task.assignedMemberId),
      dueAt: new Date(task.dueDate).toISOString(),
      priority: task.priority.toUpperCase(),
      status: TASK_STATUS_TO_API[task.status],
    },
  });
  return response;
}

export async function updateCommitteeTask(code: string, id: string, updates: Partial<CommitteeTask>) {
  return apiRequest(`/committees/${encodeURIComponent(code)}/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.assignedMemberId !== undefined ? { assignedMemberId: Number(updates.assignedMemberId) } : {}),
      ...(updates.dueDate !== undefined ? { dueAt: new Date(updates.dueDate).toISOString() } : {}),
      ...(updates.priority !== undefined ? { priority: updates.priority.toUpperCase() } : {}),
      ...(updates.status !== undefined ? { status: TASK_STATUS_TO_API[updates.status] } : {}),
    },
  });
}

export async function deleteCommitteeTask(code: string, id: string) {
  return apiRequest(`/committees/${encodeURIComponent(code)}/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function createCommitteeMember(code: string, member: { name: string; email: string }) {
  return apiRequest(`/committees/${encodeURIComponent(code)}/members`, {
    method: "POST",
    body: { fullName: member.name, email: member.email },
  });
}

/** Exact start, end and registration close times the create-event form picked, as ISO strings. */
export interface EventSchedule {
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
}

const API_QUESTION_TYPES: Record<string, "TEXT" | "RADIO" | "CHECKBOX"> = {
  "short-answer": "TEXT",
  "long-answer": "TEXT",
  "single-choice": "RADIO",
  "yes-no": "RADIO",
  "multiple-choice": "CHECKBOX",
  checkboxes: "CHECKBOX",
};

export async function createCommitteeEvent(
  code: string,
  event: Omit<CommitteeEvent, "id" | "created" | "updated">,
  schedule: EventSchedule,
) {
  return apiRequest<{ id: string }>(`/committees/${encodeURIComponent(code)}/events`, {
    method: "POST",
    body: {
      name: event.title,
      description: event.description ?? "",
      eventType: event.type,
      ...schedule,
      location: event.location,
      ...(event.mapsLink ? { mapsLink: event.mapsLink } : {}),
      capacity: event.capacity,
      ...(event.speakers ? { speakers: event.speakers } : {}),
      ...(event.requirements ? { requirements: event.requirements } : {}),
      requiredRegistrantFields: (event.requiredRegistrantFields ?? [])
        .map((value) => registrantFieldKeyByValue[value])
        .filter(Boolean),
      status: event.isDraft ? "DRAFT" : "PUBLISHED",
      questions: (event.registrationQuestions ?? []).map((question) => ({
        text: question.text,
        type: API_QUESTION_TYPES[question.type] ?? "TEXT",
        required: question.required,
        ...(question.options ? { options: question.options } : {}),
      })),
    },
  });
}

/** Full details of one of the committee's events, drafts included (event creators only). */
export interface CommitteeEventDetails {
  id: string;
  name: string;
  description: string | null;
  eventType: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  location: string | null;
  mapsLink: string | null;
  capacity: number;
  speakers: string | null;
  requirements: string | null;
  imageUrl: string | null;
  questions: { questionId: number; questionText: string; questionType: string; isRequired: boolean; options: string[] | null }[];
}

export function fetchCommitteeEvent(code: string, eventId: string) {
  return apiRequest<CommitteeEventDetails>(`/committees/${encodeURIComponent(code)}/events/${encodeURIComponent(eventId)}`);
}

/** Deletes a draft; the backend refuses published events. */
export function deleteCommitteeDraftEvent(code: string, eventId: string) {
  return apiRequest(`/committees/${encodeURIComponent(code)}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
}

export async function publishCommitteeEvent(code: string, eventId: string) {
  return apiRequest(`/committees/${encodeURIComponent(code)}/events/${encodeURIComponent(eventId)}/publish`, { method: "POST" });
}

/** Club leadership: adds an existing member to another committee as a Member. */
export async function addClubMemberToCommittee(memberId: string, committeeCode: string) {
  return apiRequest(`/club-leadership/members/${encodeURIComponent(memberId)}/committees`, {
    method: "POST",
    body: { committeeCode },
  });
}

export async function updateCommitteePoints(code: string, memberId: string, pointsDelta: number, reason: string) {
  return apiRequest(`/committees/${encodeURIComponent(code)}/members/${encodeURIComponent(memberId)}/points`, {
    method: "POST",
    body: { pointsDelta, reason },
  });
}

function relativeTime(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
