"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import type {
  CommitteeEvent,
  CommitteeMember,
  CommitteeOption,
  CommitteeTask,
  PointHistoryItem,
  RecentActivityItem,
  EventRegistration,
  RegistrationStatus,
  RegistrationConfirmationStatus,
  LeaderCommittee,
  LeaderDashboardSeed,
} from "./types";
import { committeeTranslationKeys, leaderCommitteeConfig } from "./committee-config";
import { setElevatedAccess, clearElevatedAccess } from "./accessStore";
import { readPublishedHomeEvents, toPublishedHomeEvent, PUBLISHED_HOME_EVENTS_KEY } from "@/lib/events/published-home-events";
import { applyDecision, fetchPrEvents, fetchRegistrants } from "@/lib/pr-registrations/api";
import { API_ENABLED } from "@/lib/api/client";
import { fetchCommitteeDashboard, fetchClubLeadershipDashboard, fetchDeveloperCommitteeOverview, createCommitteeEvent, publishCommitteeEvent, deleteCommitteeDraftEvent, fetchCommitteeEvent, type CommitteeEventDetails, type EventSchedule, addClubMemberToCommittee, createCommitteeMember, createCommitteeTask, updateCommitteeTask, deleteCommitteeTask, updateCommitteePoints, type CommitteeDashboardStats, type DeveloperCommitteeOverview } from "@/lib/committee-dashboard/api";

interface LeaderDashboardContextValue {
  committee: LeaderCommittee;
  developerCommitteesOverview: DeveloperCommitteeOverview[];
  clubLeadership: boolean;
  committeeName: string;
  committeeDescription: string;
  events: CommitteeEvent[];
  members: CommitteeMember[];
  /** Club leadership only: every committee, for filters and adding members. */
  committees: CommitteeOption[];
  tasks: CommitteeTask[];
  pointHistory: PointHistoryItem[];
  recentActivities: RecentActivityItem[];
  stats: CommitteeDashboardStats;
  dashboardLoading: boolean;
  dashboardError: string | null;
  currentMember: { id: string; name: string; role: string } | null;
  reloadDashboard: () => Promise<void>;
  registrations: EventRegistration[];
  // Permissions (Permanent for Leader workspace)
  canManageEvents: boolean;
  /** The backend lets this member create events for the committee. */
  canCreateEvents: boolean;
  canManageMembers: boolean;
  canAddMembers: boolean;
  canManageTasks: boolean;
  canManagePoints: boolean;
  canManageSettings: boolean;
  canManageRegistrations: boolean;
  // Event Actions
  /** Adds an event to the in-memory dashboard state and returns its new id. */
  addEvent: (event: Omit<CommitteeEvent, "id" | "created" | "updated">, schedule?: EventSchedule) => Promise<string>;
  updateEvent: (id: string, updates: Partial<CommitteeEvent>) => void;
  deleteEvent: (id: string) => void;
  publishDraft: (id: string) => Promise<void>;
  /** Full details of one of this committee's events, drafts included. */
  loadEventDetails: (id: string) => Promise<CommitteeEventDetails>;
  /** Deletes a draft event; published events cannot be deleted. */
  deleteDraft: (id: string) => Promise<void>;
  // Member Actions
  addMember: (member: { name: string; email: string }) => Promise<void>;
  addMemberToCommittee: (memberId: string, committeeCode: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<CommitteeMember>) => void;
  removeMember: (id: string) => void;
  grantTemporaryAccess: (memberId: string, durationMinutes: number) => void;
  revokeTemporaryAccess: (memberId: string) => void;
  // Task Actions
  addTask: (task: Omit<CommitteeTask, "id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<CommitteeTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Points Actions
  updateMemberPoints: (memberId: string, delta: number, reason: string) => Promise<void>;
  updateRegistrationStatus: (
    registrationId: string,
    status: RegistrationStatus,
    confirmationStatus?: RegistrationConfirmationStatus
  ) => void;
  /** API mode: the last failed registration action, as the backend explained it. */
  registrationError: string | null;
  clearRegistrationError: () => void;
  /** API mode: re-reads one event's registrants (e.g. after a QR check-in). */
  reloadRegistrations: (eventId: string) => Promise<void>;
  // Global search & filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  resetFilters: () => void;
}

const LeaderDashboardContext = createContext<LeaderDashboardContextValue | null>(null);

export function LeaderDashboardProvider({
  children,
  committee = "data-analysis",
  developerCommitteesLeader = false,
  clubLeadership = false,
  seed,
}: {
  children: ReactNode;
  committee?: LeaderCommittee;
  developerCommitteesLeader?: boolean;
  clubLeadership?: boolean;
  seed?: LeaderDashboardSeed;
}) {
  const t = useTranslations("dashboard.leader");
  const leadershipT = useTranslations("dashboard.leadershipDashboard");
  const committeeConfig = leaderCommitteeConfig[committee];
  const committeeName = clubLeadership ? leadershipT("clubTitle") : t(`nav.${committeeTranslationKeys[committee]}`);
  const committeeDescription = committeeConfig.description;
  const [events, setEvents] = useState<CommitteeEvent[]>(seed?.events ?? []);
  const [members, setMembers] = useState<CommitteeMember[]>(seed?.members ?? []);
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [tasks, setTasks] = useState<CommitteeTask[]>(seed?.tasks ?? []);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>(
    seed?.pointHistory ?? []
  );
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>(
    seed?.recentActivities ?? []
  );
  const [stats, setStats] = useState<CommitteeDashboardStats>({
    committeeMembers: 0, activeMembers: 0, awayMembers: 0, upcomingEvents: 0,
    upcomingEventsInNext30Days: 0, totalPoints: 0, pointsThisMonth: 0,
    activeTasks: 0, tasksDueThisWeek: 0, eventsCreated: 0, eventsPublishedThisYear: 0,
    pendingRegistrations: 0, acceptedRegistrations: 0, rejectedRegistrations: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<{ id: string; name: string; role: string } | null>(null);
  const [developerCommitteesOverview, setDeveloperCommitteesOverview] = useState<DeveloperCommitteeOverview[]>([]);
  const [canAddMembers, setCanAddMembers] = useState(false);
  const [canCreateEvents, setCanCreateEvents] = useState(false);
  const [prDrafts, setPrDrafts] = useState<CommitteeEvent[]>([]);
  const [canManageTasks, setCanManageTasks] = useState(false);
  const [canManagePoints, setCanManagePoints] = useState(false);
  const [canManageRegistrations, setCanManageRegistrations] = useState(false);
  // Registration records use the typed local seed until a backend contract exists.
  const [registrations, setRegistrations] = useState<EventRegistration[]>(seed?.registrations ?? []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
  };

  // Timer: Check every 5 seconds for expired temporary access
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMembers((prevMembers) => {
        let hasChanges = false;
        const updated = prevMembers.map((member) => {
          if (member.isElevated && member.accessExpiresAt && member.accessExpiresAt <= now) {
            hasChanges = true;
            return {
              ...member,
              isElevated: false,
              accessExpiresAt: null,
              accessDurationMinutes: undefined,
            };
          }
          return member;
        });
        return hasChanges ? updated : prevMembers;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Full management permissions inside the Leader workspace
  const canManageEvents = false;
  const canManageMembers = false;
  const canManageSettings = false;

  // The PR registration workflow is currently controlled by the existing API flag.
  const useApi = committee === "pr";
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const reloadRegistrations = useCallback(async (eventId: string) => {
    const fresh = await fetchRegistrants(eventId);
    setRegistrations((current) => [...current.filter((item) => item.eventId !== eventId), ...fresh]);
  }, []);

  const reloadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    if (clubLeadership) {
      const result = await fetchClubLeadershipDashboard();
      if (!result.ok) {
        setDashboardError(result.status === 401 ? "UNAUTHORIZED" : result.status === 403 ? "FORBIDDEN" : result.code);
        setDashboardLoading(false);
        return;
      }
      setEvents(result.data.events ?? []);
      setMembers(result.data.members ?? []);
      setTasks(result.data.tasks ?? []);
      setPointHistory(result.data.pointHistory ?? []);
      setRecentActivities(result.data.recentActivities ?? []);
      setStats(result.data.stats);
      setCurrentMember(result.data.currentMember);
      setCommittees(result.data.committees ?? []);
      setCanAddMembers(result.data.permissions.canAddMembers);
      setCanManageTasks(false);
      setCanManagePoints(false);
      setCanManageRegistrations(false);
      setDashboardLoading(false);
      return;
    }
    if (developerCommitteesLeader) {
      const result = await fetchDeveloperCommitteeOverview();
      if (!result.ok) {
        setDashboardError(result.status === 401 ? "UNAUTHORIZED" : result.status === 403 ? "FORBIDDEN" : result.code);
        setDashboardLoading(false);
        return;
      }
      setDeveloperCommitteesOverview(result.data);
      const memberCount = result.data.reduce((sum, item) => sum + item.memberCount, 0);
      const taskCount = result.data.reduce((sum, item) => sum + item.activeTaskCount, 0);
      setStats((current) => ({ ...current, committeeMembers: memberCount, activeMembers: memberCount, activeTasks: taskCount }));
      setDashboardLoading(false);
      return;
    }
    const result = await fetchCommitteeDashboard(committeeConfig.committeeCode);
    if (!result.ok) {
      setDashboardError(result.status === 401 ? "UNAUTHORIZED" : result.status === 403 ? "FORBIDDEN" : result.code);
      setDashboardLoading(false);
      return;
    }
    // PR reviews every committee's published events (fetchPrEvents); from its own events it only adds the drafts.
    if (useApi) setPrDrafts((result.data.events ?? []).filter((event) => event.status === "Draft"));
    else setEvents(result.data.events ?? []);
    setCanCreateEvents(result.data.permissions.canCreateEvents ?? false);
    setMembers(result.data.members ?? []);
    setTasks(result.data.tasks ?? []);
    setPointHistory(result.data.pointHistory ?? []);
    setRecentActivities(result.data.recentActivities ?? []);
    setStats(result.data.stats);
    setCurrentMember(result.data.currentMember);
    setCanAddMembers(result.data.permissions.canAddMembers);
    setCanManageTasks(result.data.permissions.canManageTasks);
    setCanManagePoints(result.data.permissions.canManagePoints);
    setCanManageRegistrations(result.data.permissions.canManageRegistrations);
    setDashboardLoading(false);
  }, [committeeConfig.committeeCode, clubLeadership, developerCommitteesLeader, useApi]);

  useEffect(() => {
    queueMicrotask(() => void reloadDashboard());
  }, [reloadDashboard]);

  const reloadPrEvents = useCallback(async () => {
    const list = await fetchPrEvents();
    setEvents(list);
    setRegistrations((await Promise.all(list.map((event) => fetchRegistrants(event.id)))).flat());
  }, []);

  useEffect(() => {
    if (!useApi) return;
    queueMicrotask(() => void reloadPrEvents());
  }, [useApi, reloadPrEvents]);

  const updateRegistrationStatus = (
    registrationId: string,
    status: RegistrationStatus,
    confirmationStatus?: RegistrationConfirmationStatus
  ) => {
    if (useApi) {
      const registration = registrations.find((item) => item.id === registrationId);
      if (!registration) return;
      const eventRegistrations = registrations.filter((item) => item.eventId === registration.eventId);
      void applyDecision(registration, status, eventRegistrations).then(async (error) => {
        setRegistrationError(error);
        await reloadRegistrations(registration.eventId);
      });
      return;
    }
    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === registrationId
          ? {
              ...registration,
              status,
              confirmationStatus:
                confirmationStatus ??
                (status === "Accepted" ? "NotSent" : undefined),
              waitlistPosition:
                status === "Waitlisted"
                  ? registration.waitlistPosition ??
                    current.filter((item) => item.eventId === registration.eventId && item.status === "Waitlisted").length + 1
                  : undefined,
            }
          : registration
      )
    );
  };

  const syncHomepageEvent = (event: CommitteeEvent | null, eventId?: string) => {
    if (typeof window === "undefined") return;
    const published = readPublishedHomeEvents().filter((item) => item.id !== (event?.id ?? eventId));
    if (event && event.status !== "Draft" && event.isDraft !== true) {
      published.unshift(toPublishedHomeEvent(event));
    }
    window.localStorage.setItem(PUBLISHED_HOME_EVENTS_KEY, JSON.stringify(published));
  };

  // Event handlers
  const addEvent = async (data: Omit<CommitteeEvent, "id" | "created" | "updated">, schedule?: EventSchedule) => {
    if (API_ENABLED) {
      if (!schedule) throw new Error("The event schedule is missing.");
      const result = await createCommitteeEvent(committeeConfig.committeeCode, data, schedule);
      // Field details say what to fix, e.g. "Choice questions need at least two different options."
      if (!result.ok) throw new Error([result.message, ...result.details.map((detail) => detail.message)].join(" "));
      await Promise.all([reloadDashboard(), useApi ? reloadPrEvents() : Promise.resolve()]);
      return result.data.id;
    }
    const newEvent: CommitteeEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      created: "Today",
      updated: "Just now",
      isDraft: data.status === "Draft",
    };
    setEvents((prev) => [newEvent, ...prev]);
    syncHomepageEvent(newEvent);

    // Add recent activity
    const newAct: RecentActivityItem = {
      id: `act-${Date.now()}`,
      type: "event_published",
      title: data.status === "Draft" ? "Draft saved" : "Event created",
      description: `New event "${data.title}" was ${data.status === "Draft" ? "saved as draft" : "published"}.`,
      timeAgo: "Just now",
    };
    setRecentActivities((prev) => [newAct, ...prev]);
    return newEvent.id;
  };

  const updateEvent = (id: string, updates: Partial<CommitteeEvent>) => {
    const current = events.find((event) => event.id === id);
    if (current) syncHomepageEvent({ ...current, ...updates }, id);
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updated: "Just now" } : e))
    );
  };

  const deleteEvent = (id: string) => {
    syncHomepageEvent(null, id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const loadEventDetails = async (id: string) => {
    const result = await fetchCommitteeEvent(committeeConfig.committeeCode, id);
    if (!result.ok) throw new Error(result.message);
    return result.data;
  };

  const deleteDraft = async (id: string) => {
    if (API_ENABLED) {
      const result = await deleteCommitteeDraftEvent(committeeConfig.committeeCode, id);
      if (!result.ok) throw new Error(result.message);
      await reloadDashboard();
      return;
    }
    deleteEvent(id);
  };

  const publishDraft = async (id: string) => {
    if (API_ENABLED) {
      const result = await publishCommitteeEvent(committeeConfig.committeeCode, id);
      if (!result.ok) throw new Error([result.message, ...result.details.map((detail) => detail.message)].join(" "));
      await Promise.all([reloadDashboard(), useApi ? reloadPrEvents() : Promise.resolve()]);
      return;
    }
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "Upcoming",
              isDraft: false,
              updated: "Just now",
            }
          : e
      )
    );

    const target = events.find((e) => e.id === id);
    if (target) {
      syncHomepageEvent({ ...target, status: "Upcoming", isDraft: false, updated: "Just now" });
      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "event_published",
          title: "Draft published",
          description: `"${target.title}" was published to platform.`,
          timeAgo: "Just now",
        },
        ...prev,
      ]);
    }
  };

  // Member handlers
  const addMember = async (data: { name: string; email: string }) => {
    const result = await createCommitteeMember(committeeConfig.committeeCode, data);
    if (!result.ok) throw new Error(result.message);
    await reloadDashboard();
  };

  const addMemberToCommittee = async (memberId: string, committeeCode: string) => {
    const result = await addClubMemberToCommittee(memberId, committeeCode);
    if (!result.ok) throw new Error(result.message);
    await reloadDashboard();
  };

  const updateMember =(id: string, updates: Partial<CommitteeMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const grantTemporaryAccess = (memberId: string, durationMinutes: number) => {
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              isElevated: true,
              accessExpiresAt: expiresAt,
              accessDurationMinutes: durationMinutes,
            }
          : m
      )
    );

    const member = members.find((m) => m.id === memberId);
    if (member) {
      setElevatedAccess(member.email, durationMinutes, committee);

      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "details_updated",
          title: "Temporary access granted",
          description: `${member.name} was granted elevated access for ${durationMinutes} minutes.`,
          timeAgo: "Just now",
        },
        ...prev,
      ]);
    }
  };

  const revokeTemporaryAccess = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              isElevated: false,
              accessExpiresAt: null,
              accessDurationMinutes: undefined,
            }
          : m
      )
    );

    clearElevatedAccess();
  };

  // Task handlers
  const addTask = async (data: Omit<CommitteeTask, "id">) => {
    const result = await createCommitteeTask(committeeConfig.committeeCode, data);
    if (!result.ok) throw new Error(result.message);
    await reloadDashboard();
  };

  const updateTask = async (id: string, updates: Partial<CommitteeTask>) => {
    const result = await updateCommitteeTask(committeeConfig.committeeCode, id, updates);
    if (!result.ok) throw new Error(result.message);
    await reloadDashboard();
  };

  const deleteTask = async (id: string) => {
    const result = await deleteCommitteeTask(committeeConfig.committeeCode, id);
    if (!result.ok) throw new Error(result.message);
    await reloadDashboard();
  };

  // Points handler
  const updateMemberPoints = async (memberId: string, delta: number, reason: string) => {
    const result = await updateCommitteePoints(committeeConfig.committeeCode, memberId, delta, reason);
    if (!result.ok) throw new Error(result.message);
    await reloadDashboard();
  };

  const value = {
    committee,
    developerCommitteesOverview,
    clubLeadership,
    committeeName,
    committeeDescription,
    events: useApi ? [...events, ...prDrafts.filter((draft) => !events.some((event) => event.id === draft.id))] : events,
    members,
    committees,
    tasks,
    pointHistory,
    recentActivities,
    stats,
    dashboardLoading,
    dashboardError,
    currentMember,
    reloadDashboard,
    registrations,
    canManageEvents,
    canCreateEvents,
    canManageMembers,
    canAddMembers,
    canManageTasks,
    canManagePoints,
    canManageSettings,
    canManageRegistrations,
    addEvent,
    updateEvent,
    deleteEvent,
    publishDraft,
    loadEventDetails,
    deleteDraft,
    addMember,
    addMemberToCommittee,
    updateMember,
    removeMember,
    grantTemporaryAccess,
    revokeTemporaryAccess,
    addTask,
    updateTask,
    deleteTask,
    updateMemberPoints,
    updateRegistrationStatus,
    registrationError,
    clearRegistrationError: () => setRegistrationError(null),
    reloadRegistrations,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    resetFilters,
  };

  return (
    <LeaderDashboardContext.Provider value={value}>
      {children}
    </LeaderDashboardContext.Provider>
  );
}

export function useLeaderDashboard() {
  const context = useContext(LeaderDashboardContext);
  if (!context) {
    throw new Error("useLeaderDashboard must be used within a LeaderDashboardProvider");
  }
  return context;
}
