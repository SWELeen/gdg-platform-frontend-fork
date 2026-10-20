"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  CommitteeEvent,
  CommitteeMember,
  CommitteeTask,
  PointHistoryItem,
  RecentActivityItem,
  EventRegistration,
  RegistrationStatus,
  RegistrationConfirmationStatus,
  LeaderCommittee,
  LeaderDashboardSeed,
} from "./types";
import { leaderCommitteeConfig } from "./committee-config";
import { setElevatedAccess, clearElevatedAccess } from "./accessStore";
import { readPublishedHomeEvents, toPublishedHomeEvent, PUBLISHED_HOME_EVENTS_KEY } from "@/lib/events/published-home-events";
import { API_ENABLED } from "@/lib/api/client";
import { applyDecision, fetchPrEvents, fetchRegistrants } from "@/lib/pr-registrations/api";

interface LeaderDashboardContextValue {
  committee: LeaderCommittee;
  committeeName: string;
  committeeDescription: string;
  events: CommitteeEvent[];
  members: CommitteeMember[];
  tasks: CommitteeTask[];
  pointHistory: PointHistoryItem[];
  recentActivities: RecentActivityItem[];
  registrations: EventRegistration[];
  // Permissions (Permanent for Leader workspace)
  canManageEvents: boolean;
  canManageMembers: boolean;
  canManageTasks: boolean;
  canManagePoints: boolean;
  canManageSettings: boolean;
  canManageRegistrations: boolean;
  // Event Actions
  /** Adds an event to the in-memory dashboard state and returns its new id. */
  addEvent: (event: Omit<CommitteeEvent, "id" | "created" | "updated">) => string;
  updateEvent: (id: string, updates: Partial<CommitteeEvent>) => void;
  deleteEvent: (id: string) => void;
  publishDraft: (id: string) => void;
  // Member Actions
  addMember: (member: Omit<CommitteeMember, "id" | "points" | "tasksCompleted" | "initials" | "avatarBgColor" | "lastActivity" | "isElevated" | "accessExpiresAt">) => void;
  updateMember: (id: string, updates: Partial<CommitteeMember>) => void;
  removeMember: (id: string) => void;
  grantTemporaryAccess: (memberId: string, durationMinutes: number) => void;
  revokeTemporaryAccess: (memberId: string) => void;
  // Task Actions
  addTask: (task: Omit<CommitteeTask, "id">) => void;
  updateTask: (id: string, updates: Partial<CommitteeTask>) => void;
  deleteTask: (id: string) => void;
  // Points Actions
  updateMemberPoints: (memberId: string, delta: number, reason: string) => void;
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
  seed,
}: {
  children: ReactNode;
  committee?: LeaderCommittee;
  seed?: LeaderDashboardSeed;
}) {
  const committeeConfig = leaderCommitteeConfig[committee];
  const committeeName = committeeConfig.name;
  const committeeDescription = committeeConfig.description;
  const [events, setEvents] = useState<CommitteeEvent[]>(seed?.events ?? []);
  const [members, setMembers] = useState<CommitteeMember[]>(seed?.members ?? []);
  const [tasks, setTasks] = useState<CommitteeTask[]>(seed?.tasks ?? []);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>(
    seed?.pointHistory ?? []
  );
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>(
    seed?.recentActivities ?? []
  );
  // Registration records come from the typed demo seed until a backend contract exists.
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
  const canManageEvents = committeeConfig.canManageEvents;
  const canManageMembers = true;
  const canManageTasks = true;
  const canManagePoints = true;
  const canManageSettings = true;
  const canManageRegistrations = committeeConfig.canManageRegistrations;

  // With NEXT_PUBLIC_USE_API=true the PR workspace reads and changes real
  // registrations; every other workspace keeps its seeded demo data.
  const useApi = API_ENABLED && committee === "pr";
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const reloadRegistrations = useCallback(async (eventId: string) => {
    const fresh = await fetchRegistrants(eventId);
    setRegistrations((current) => [...current.filter((item) => item.eventId !== eventId), ...fresh]);
  }, []);

  useEffect(() => {
    if (!useApi) return;
    fetchPrEvents().then(async (list) => {
      setEvents(list);
      setRegistrations((await Promise.all(list.map((event) => fetchRegistrants(event.id)))).flat());
    });
  }, [useApi]);

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
  const addEvent = (data: Omit<CommitteeEvent, "id" | "created" | "updated">) => {
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

  const publishDraft = (id: string) => {
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
  const addMember = (
    data: Omit<
      CommitteeMember,
      "id" | "points" | "tasksCompleted" | "initials" | "avatarBgColor" | "lastActivity" | "isElevated" | "accessExpiresAt"
    >
  ) => {
    const initials = data.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newMember: CommitteeMember = {
      ...data,
      id: `mem-${Date.now()}`,
      initials,
      avatarBgColor: "bg-blue-100 text-blue-700",
      points: 0,
      tasksCompleted: 0,
      lastActivity: "Just now",
      isElevated: false,
      accessExpiresAt: null,
    };
    setMembers((prev) => [newMember, ...prev]);
  };

  const updateMember = (id: string, updates: Partial<CommitteeMember>) => {
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
  const addTask = (data: Omit<CommitteeTask, "id">) => {
    const newTask: CommitteeTask = {
      ...data,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<CommitteeTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Points handler
  const updateMemberPoints = (memberId: string, delta: number, reason: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              points: Math.max(0, m.points + delta),
              lastActivity: "Just now",
            }
          : m
      )
    );

    const member = members.find((m) => m.id === memberId);
    if (member) {
      const historyItem: PointHistoryItem = {
        id: `ph-${Date.now()}`,
        memberId,
        memberName: member.name,
        pointsDelta: delta,
        reason: reason || "Manual point adjustment",
        timestamp: "Just now",
      };
      setPointHistory((prev) => [historyItem, ...prev]);

      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "points_awarded",
          title: delta >= 0 ? "Points awarded" : "Points deducted",
          description: `${delta >= 0 ? "+" : ""}${delta} points to ${member.name} for ${reason || "contribution"}.`,
          timeAgo: "Just now",
        },
        ...prev,
      ]);
    }
  };

  const value = {
    committee,
    committeeName,
    committeeDescription,
    events,
    members,
    tasks,
    pointHistory,
    recentActivities,
    registrations,
    canManageEvents,
    canManageMembers,
    canManageTasks,
    canManagePoints,
    canManageSettings,
    canManageRegistrations,
    addEvent,
    updateEvent,
    deleteEvent,
    publishDraft,
    addMember,
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
