import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, ListChecks, UserRound } from "lucide-react";
import { MEMBER_EVENTS_PATH, UPCOMING_EVENTS_PATH } from "@/components/dashboard/member/member-events";
import { MEMBER_SETTINGS_PATH, MEMBER_TASKS_PATH } from "../member-routes";

// Structure of the Help & Support content. All wording lives in
// messages/{en,ar}/dashboard.json under dashboard.memberHelp, keyed by these ids,
// and describes how the dashboard works today (no promises of unavailable features).

export type HelpCategoryId = "events" | "tasks" | "account" | "notifications";

export const helpCategories: { id: HelpCategoryId; icon: LucideIcon; tone: string }[] = [
  { id: "events", icon: CalendarDays, tone: "bg-gdg-blue-light text-gdg-dark" },
  { id: "tasks", icon: ListChecks, tone: "bg-gdg-green-light text-gdg-dark" },
  { id: "account", icon: UserRound, tone: "bg-gdg-pink-light text-gdg-dark" },
  { id: "notifications", icon: Bell, tone: "bg-gdg-yellow-light text-gdg-dark" },
];

export interface HelpFaq {
  id: string;
  category: HelpCategoryId;
  /** Optional page the answer points to; its label is faqs.<id>.link. */
  href?: string;
}

export const helpFaqs: HelpFaq[] = [
  { id: "viewUpcoming", category: "events", href: UPCOMING_EVENTS_PATH },
  { id: "registrationStatus", category: "events", href: MEMBER_EVENTS_PATH },
  { id: "registeredEvents", category: "events", href: MEMBER_EVENTS_PATH },
  { id: "findTasks", category: "tasks", href: MEMBER_TASKS_PATH },
  { id: "taskStatuses", category: "tasks" },
  { id: "taskProblem", category: "tasks" },
  { id: "committeeInfo", category: "account", href: MEMBER_SETTINGS_PATH },
  { id: "editCommittee", category: "account" },
  { id: "memberVsLeader", category: "account" },
  { id: "changeNotifications", category: "notifications", href: MEMBER_SETTINGS_PATH },
  { id: "toggleUpdates", category: "notifications", href: MEMBER_SETTINGS_PATH },
  { id: "notReceiving", category: "notifications" },
];
