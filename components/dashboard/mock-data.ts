// Mock data for the Members Dashboard (app/[locale]/dashboard/members-dashboard/page.tsx).
// There is no approved dashboard API contract yet (see docs/api-integration.md),
// so this module is the single, typed swap point for real backend data later.

import { MEMBER_EVENTS_PATH, UPCOMING_EVENTS_PATH } from "@/components/dashboard/member/member-events";
import { MEMBER_HELP_PATH, MEMBER_SETTINGS_PATH } from "@/components/dashboard/members/member-routes";

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "In Progress" | "To Do" | "Complete";

export interface DashboardUser {
  name: string;
  initials: string;
  role: string;
  membership: string;
}

export interface SidebarItem {
  /** Also the translation key under dashboard.nav.items. */
  id: string;
  /**
   * Real route once implemented; "#" is the intentional placeholder for pages that don't
   * exist yet (Events, Setting, Help). Swapping "#" for the
   * real path is the only change needed to activate route-based highlighting for that item.
   */
  href: string;
  /** Other routes that also highlight this item (e.g. Upcoming Events under Events). */
  activeFor?: string[];
}

export interface MyEventTile {
  id: string;
  /** Translation key under dashboard.tiles (title, description, action). */
  key: "myEvents";
  /** Tailwind background utility for the card surface. */
  background: string;
  /** Tailwind text-color utility for the arrow icon inside the (white) corner action circle. */
  accent: string;
}

export interface UpcomingEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
  featured: boolean;
  /** Backend-provided cover image URL. Falls back to a CSS gradient while unset. */
  imageUrl?: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export const currentUser: DashboardUser = {
  name: "Leen Kharraz",
  initials: "LK",
  role: "Web Development",
  membership: "Member",
};


export const sidebarPrimaryItems: SidebarItem[] = [
  { id: "dashboard", href: "/dashboard/members-dashboard" },
  { id: "events", href: MEMBER_EVENTS_PATH, activeFor: [UPCOMING_EVENTS_PATH] },
  { id: "tasks", href: "/dashboard/members-dashboard/tasks" },
  { id: "members", href: "/dashboard/members-dashboard/members" },
  { id: "achievements", href: "/dashboard/members-dashboard/achievements" },
];

export const sidebarSecondaryItems: SidebarItem[] = [
  { id: "setting", href: MEMBER_SETTINGS_PATH },
  { id: "help", href: MEMBER_HELP_PATH },
];

export const myEventTiles: MyEventTile[] = [
  {
    id: "events-blue",
    key: "myEvents",
    background: "bg-gdg-blue-light",
    accent: "text-gdg-blue-accent",
  },
  {
    id: "events-green",
    key: "myEvents",
    background: "bg-gdg-green-light",
    accent: "text-gdg-green-accent",
  },
  {
    id: "events-pink",
    key: "myEvents",
    background: "bg-gdg-pink-light",
    accent: "text-gdg-pink-accent",
  },
  {
    id: "events-yellow",
    key: "myEvents",
    background: "bg-gdg-yellow-light",
    accent: "text-gdg-yellow-accent",
  },
];

// An array (rather than a single object) so the UI can already branch on an empty
// vs. non-empty collection ahead of real backend data.
export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "evt-1",
    day: "20",
    month: "Sep",
    title: "Event Name",
    location: "COCON Tree",
    time: "7:00 PM - 9:30 PM",
    featured: true,
  },
];

export const dashboardTasks: DashboardTask[] = [
  {
    id: "task-1",
    title: "Design Event Poster",
    description: "Create the visual poster for upcoming flutter workshop",
    deadline: "Sep 20, 2026",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "task-2",
    title: "Implement Dashboard Header",
    description: "Build the dashboard header based on the approved Figma design.",
    deadline: "Sep 25, 2026",
    priority: "Medium",
    status: "To Do",
  },
  {
    id: "task-3",
    title: "Connect Login to Authentication",
    description: "Integrate the login form with the authentication service.",
    deadline: "Sep 29, 2026",
    priority: "Low",
    status: "Complete",
  },
];
