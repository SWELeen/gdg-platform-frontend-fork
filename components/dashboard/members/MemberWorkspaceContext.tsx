"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { API_ENABLED } from "@/lib/api/client";
import {
  fetchMemberIdentity,
  fetchMyTasks,
  updateMyTaskStatus,
  type MemberCommittee,
  type MemberSettableStatus,
  type MemberTask,
} from "@/lib/member-dashboard/api";
import { currentUser, dashboardTasks, type DashboardTask, type DashboardUser } from "@/components/dashboard/mock-data";

const SELECTED_COMMITTEE_KEY = "gdg.members.selectedCommittee";

interface MemberWorkspaceValue {
  user: DashboardUser;
  committees: MemberCommittee[];
  selectedCommittee: string | null;
  selectCommittee: (code: string) => void;
  /** Tasks of the selected committee only. */
  tasks: DashboardTask[];
  status: "loading" | "ready" | "error";
  retry: () => void;
  /** Only with the API: members move their own tasks; null otherwise. Rejects with the reason when refused. */
  updateTaskStatus: ((taskId: string, status: MemberSettableStatus) => Promise<void>) | null;
}

const MemberWorkspaceContext = createContext<MemberWorkspaceValue | null>(null);

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function readSavedCommittee() {
  try {
    return window.localStorage.getItem(SELECTED_COMMITTEE_KEY);
  } catch {
    return null;
  }
}

/** The signed-in member, their committees and their own tasks, shared by every member dashboard page. */
export function MemberWorkspaceProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<{ fullName: string; committees: MemberCommittee[] } | null>(null);
  const [allTasks, setAllTasks] = useState<MemberTask[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(API_ENABLED ? "loading" : "ready");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    void Promise.all([fetchMemberIdentity(), fetchMyTasks()]).then(([me, tasks]) => {
      if (!active) return;
      if (!me.ok || !tasks.ok) {
        setStatus("error");
        return;
      }
      const committees = me.data.committees ?? [];
      const saved = readSavedCommittee();
      setIdentity({ fullName: me.data.fullName, committees });
      setAllTasks(tasks.data);
      setSelectedCommittee(committees.some((item) => item.code === saved) ? saved : (committees[0]?.code ?? null));
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  const selectCommittee = useCallback((code: string) => {
    setSelectedCommittee(code);
    try {
      window.localStorage.setItem(SELECTED_COMMITTEE_KEY, code);
    } catch {
      // Remembering the choice is only a convenience.
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, nextStatus: MemberSettableStatus) => {
    const result = await updateMyTaskStatus(taskId, nextStatus);
    if (!result.ok) throw new Error(result.message);
    setAllTasks((current) => current.map((task) => (task.id === taskId ? result.data : task)));
  }, []);

  const value = useMemo<MemberWorkspaceValue>(() => {
    if (!API_ENABLED) {
      return { user: currentUser, committees: [], selectedCommittee: null, selectCommittee, tasks: dashboardTasks, status, retry: () => undefined, updateTaskStatus: null };
    }
    const committee = identity?.committees.find((item) => item.code === selectedCommittee);
    return {
      user: {
        name: identity?.fullName ?? "",
        initials: initialsOf(identity?.fullName ?? ""),
        role: committee?.name ?? "",
        membership: committee?.position ?? "",
      },
      committees: identity?.committees ?? [],
      selectedCommittee,
      selectCommittee,
      tasks: allTasks.filter((task) => task.committeeCode === selectedCommittee),
      status,
      retry: () => {
        setStatus("loading");
        setAttempt((current) => current + 1);
      },
      updateTaskStatus,
    };
  }, [identity, allTasks, selectedCommittee, selectCommittee, status, updateTaskStatus]);

  return <MemberWorkspaceContext.Provider value={value}>{children}</MemberWorkspaceContext.Provider>;
}

export function useMemberWorkspace() {
  const value = useContext(MemberWorkspaceContext);
  if (!value) throw new Error("useMemberWorkspace must be used inside MemberWorkspaceProvider");
  return value;
}
