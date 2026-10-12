// Mock data for the Members Dashboard (app/[locale]/dashboard/members-dashboard/page.tsx).
// There is no approved dashboard API contract yet (see docs/api-integration.md),
// so this module is the single, typed swap point for real backend data later.

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
   * exist yet (Events, Tasks, Members, Achievements, Setting, Help). Swapping "#" for the
   * real path is the only change needed to activate route-based highlighting for that item.
   */
  href: string;
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

export interface CalendarMockData {
  /** 0-based, matches Date#getMonth(). */
  year: number;
  month: number;
  /** Day-of-month highlighted as the current/selected date. */
  selectedDay: number;
  /** Days-of-month (within the same year/month above) that have an event. */
  eventDays: number[];
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
  { id: "events", href: "#" },
  { id: "tasks", href: "#" },
  { id: "members", href: "#" },
  { id: "achievements", href: "#" },
];

export const sidebarSecondaryItems: SidebarItem[] = [
  { id: "setting", href: "#" },
  { id: "help", href: "#" },
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

export const calendarMock: CalendarMockData = {
  year: 2026,
  month: 8, // September
  selectedDay: 20,
  eventDays: [20],
};

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
