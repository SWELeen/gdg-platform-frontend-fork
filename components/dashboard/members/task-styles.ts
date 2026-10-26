import type { TaskPriority, TaskStatus } from "@/components/dashboard/mock-data";

// Status/priority values are data (and will come from the backend), so only their display
// text is translated: these map each value to its key under dashboard.tasks.
export const statusKeys: Record<TaskStatus, "inProgress" | "toDo" | "pendingReview" | "complete"> = {
  "In Progress": "inProgress",
  "To Do": "toDo",
  "Pending Review": "pendingReview",
  Complete: "complete",
};

export const priorityKeys: Record<TaskPriority, "high" | "medium" | "low"> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

// Single source of truth for each semantic tone's light background + text color, so
// status badges, priority badges, and task filters can never drift out of sync — they
// all read the exact same class string for a given tone.
export const toneColors = {
  red: "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]",
  yellow: "bg-[var(--dashboard-yellow-bg)] text-[var(--dashboard-yellow-text)]",
  blue: "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]",
  green: "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
} as const;

export type Tone = keyof typeof toneColors;

// Text-only counterpart of `toneColors`, for icons that should match a count pill's tone.
export const toneText: Record<Tone, string> = {
  red: "text-[var(--dashboard-red-text)]",
  yellow: "text-[var(--dashboard-yellow-text)]",
  blue: "text-[var(--dashboard-blue-text)]",
  green: "text-[var(--dashboard-green-text)]",
  violet: "text-violet-700 dark:text-violet-300",
};

// Status badges are the visual source of truth for shape (pill/capsule) and sizing.
export const PILL_SHAPE = "rounded-full px-2.5 py-1";

export const statusTones: Record<TaskStatus, Tone> = {
  "In Progress": "yellow",
  "To Do": "blue",
  "Pending Review": "violet",
  Complete: "green",
};

export const statusStyles: Record<TaskStatus, string> = {
  "In Progress": `${PILL_SHAPE} ${toneColors[statusTones["In Progress"]]}`,
  "To Do": `${PILL_SHAPE} ${toneColors[statusTones["To Do"]]}`,
  "Pending Review": `${PILL_SHAPE} ${toneColors[statusTones["Pending Review"]]}`,
  Complete: `${PILL_SHAPE} ${toneColors[statusTones.Complete]}`,
};

// Priority badges reuse the exact same pill shape and tone colors as the status badges
// (Medium shares In Progress's tone, Low shares Complete's tone) — same design system,
// only the semantic mapping differs.
export const priorityTones: Record<TaskPriority, Tone> = {
  High: "red",
  Medium: statusTones["In Progress"],
  Low: statusTones.Complete,
};

export const priorityStyles: Record<TaskPriority, string> = {
  High: `${PILL_SHAPE} ${toneColors[priorityTones.High]}`,
  Medium: `${PILL_SHAPE} ${toneColors[priorityTones.Medium]}`,
  Low: `${PILL_SHAPE} ${toneColors[priorityTones.Low]}`,
};
