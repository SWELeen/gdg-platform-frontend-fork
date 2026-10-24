import type {
  CommitteeEvent,
  CommitteeMember,
  CommitteeTask,
  LeaderDashboardSeed,
  PointHistoryItem,
  RecentActivityItem,
} from "@/components/dashboard/shared/types";
import { apiRequest, type ApiResult } from "@/lib/api/client";

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
  };
}

type ApiMember = Omit<CommitteeMember, "isElevated" | "accessExpiresAt" | "initials" | "avatarBgColor" | "lastActivity"> & { lastActivity: string | null };
type ApiTask = {
  id: string; title: string; description: string; assignedMemberId: string;
  assignedMemberName: string; createdByMemberId: string; dueAt: string;
  priority: string; status: string; createdAt: string; updatedAt: string;
};

type RawCommitteeDashboardData = Omit<CommitteeDashboardData, "members" | "events" | "tasks" | "pointHistory" | "recentActivities"> & {
  members: ApiMember[];
  events: { id: string; title: string; date: string; endsAt: string; location: string | null; status: string; registered: number; confirmed: number; checkedIn: number; capacity: number; createdAt: string }[];
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
        type: "Workshop",
        date: event.date,
        time: "",
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
      })),
      pointHistory: data.pointHistory.map((item) => ({ ...item, timestamp: relativeTime(item.createdAt) })),
      recentActivities: data.recentActivities.map((item) => ({ ...item, timeAgo: relativeTime(item.createdAt) })),
    };
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
      status: task.status === "Completed" ? "COMPLETED" : task.status === "In Progress" ? "IN_PROGRESS" : "TODO",
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
      ...(updates.status !== undefined ? { status: updates.status === "Completed" ? "COMPLETED" : updates.status === "In Progress" ? "IN_PROGRESS" : "TODO" } : {}),
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
