"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { Link } from "@/i18n/navigation";
import { getElevatedAccess } from "@/components/dashboard/shared/accessStore";
import { leaderCommitteeConfig } from "@/components/dashboard/shared/committee-config";
import { leaderDashboardMockData } from "@/data/leader-dashboard";
import { MembersCompactNav } from "@/components/dashboard/members/MembersCompactNav";
import { MemberEventCards } from "@/components/dashboard/member/MemberEventCards";
import { DashboardUpcomingEvents } from "@/components/dashboard/member/DashboardUpcomingEvents";
import { MemberCalendarCard } from "@/components/dashboard/member/MemberCalendarCard";
import { IconChecklist } from "@/components/dashboard/members/nav-icons";
import type { IconProps } from "@/components/dashboard/members/nav-icons";
import { MembersUserInfo } from "@/components/dashboard/members/MembersUserInfo";
import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { TaskProgress } from "@/components/dashboard/members/TaskProgress";
import { ViewAllBadge } from "@/components/dashboard/members/ViewAllBadge";
import { CARD_TITLE, DASHBOARD_CARD } from "@/components/dashboard/members/card-styles";
import {
  priorityKeys,
  priorityStyles,
  statusKeys,
  statusStyles,
  statusTones,
  toneColors,
} from "@/components/dashboard/members/task-styles";
import type { Tone } from "@/components/dashboard/members/task-styles";

import {
  myEventTiles,
  sidebarPrimaryItems,
} from "@/components/dashboard/mock-data";
import type {
  DashboardTask,
  TaskStatus,
} from "@/components/dashboard/mock-data";
import { useMemberWorkspace } from "@/components/dashboard/members/MemberWorkspaceContext";

// Entrance animation shared by the main dashboard sections. `MotionConfig
// reducedMotion="user"` (in the members-dashboard layout) automatically strips the transform-based
// part of these animations when the visitor prefers reduced motion.
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Dates are formatted with the locale from the URL (never `undefined`, which resolves to
// the runtime's default and differs between server and browser, causing hydration
// mismatches). Western digits keep dates consistent with the other numbers on the page.
const DATE_OPTIONS = { numberingSystem: "latn" } as const;

// "View all tasks" goes wherever the sidebar's Tasks item goes, so the two never drift apart.
const TASKS_HREF = sidebarPrimaryItems.find((item) => item.id === "tasks")?.href ?? "/dashboard/members-dashboard/tasks";

// The real date is only known once we're running in the browser, so `getServerSnapshot`
// returns a fixed "Today" fallback for the server-rendered/first-hydration pass (matching
// on both sides avoids a hydration mismatch), and `getSnapshot` supplies the real,
// browser-local date for every client render after that. No subscription is needed since
// this value never changes without a full page reload.
const subscribeToNothing = () => () => {};

// Builds the utility-row label from the browser's local date, e.g. "Today, Wed 16 Sep".
function useTodayLabel(): string {
  const locale = useLocale();
  const t = useTranslations("dashboard.utility");

  const formatTodayLabel = (date: Date) =>
    t("todayLabel", {
      weekday: date.toLocaleDateString(locale, { ...DATE_OPTIONS, weekday: "short" }),
      day: date.toLocaleDateString(locale, { ...DATE_OPTIONS, day: "numeric" }),
      month: date.toLocaleDateString(locale, { ...DATE_OPTIONS, month: "short" }),
    });

  return useSyncExternalStore(
    subscribeToNothing,
    () => formatTodayLabel(new Date()),
    () => t("today"),
  );
}

/* ------------------------------------------------------------------ */
/* Icons (inline SVGs — no icon package is installed in this project)  */
/* ------------------------------------------------------------------ */

function IconSearch({ className }: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function IconBell({ className }: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

function IconCheck({ className }: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 12.5 9 17.5 20 6.5" />
    </svg>
  );
}

function Checkbox({ checked }: { checked: boolean }): ReactElement {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
        checked ? "border-gdg-green bg-gdg-green text-[var(--white)]" : "border-border bg-surface"
      }`}
      aria-hidden="true"
    >
      {checked && <IconCheck className="h-3.5 w-3.5" />}
    </span>
  );
}

function PaginationDots({ count, activeIndex = 0 }: { count: number; activeIndex?: number }): ReactElement {
  return (
    <div className="flex items-center gap-1.5" role="presentation">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`h-1.5 rounded-full transition-all ${
            index === activeIndex ? "w-4 bg-foreground" : "w-1.5 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard content sections                                          */
/* ------------------------------------------------------------------ */

function SearchField({
  searchQuery,
  onSearchChange,
  className = "",
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  className?: string;
}): ReactElement {
  const t = useTranslations("dashboard.utility");

  return (
    <label className={`relative block w-full ${className}`}>
      <span className="sr-only">{t("searchLabel")}</span>
      <IconSearch className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        maxLength={255}
        className="w-full rounded-full border border-border bg-surface-muted/60 py-2 ps-9 pe-4 text-base text-foreground placeholder:text-muted focus:border-gdg-blue focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gdg-blue/30"
      />
    </label>
  );
}

// Phone and tablet: [account+bell] at the start, [date] pushed to the far end via `ms-auto`;
// search is hidden here and reappears lower in the page, after the internal nav.
// Desktop (lg+): search at the start, account group at the end — achieved by flipping
// `order` at `lg` rather than duplicating markup.
function UtilityRow({
  today,
  searchQuery,
  onSearchChange,
}: {
  today: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}): ReactElement {
  const t = useTranslations("dashboard.utility");

  return (
    <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
      <div className="order-1 flex w-full items-center gap-2 lg:w-auto lg:order-2">
        <MembersUserInfo />

        <button
          type="button"
          aria-label={t("notifications")}
          className="relative order-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-foreground"
        >
          <IconBell className="h-5 w-5" />
          <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-gdg-red" aria-hidden="true" />
        </button>

        <p className="order-3 ms-auto shrink-0 text-xs font-medium text-muted lg:ms-0 sm:text-sm lg:order-1">
          {today}
        </p>
      </div>

      <SearchField
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        className="order-2 hidden lg:block lg:max-w-xs lg:order-1"
      />
    </motion.div>
  );
}

function WelcomeSection({ firstName }: { firstName: string }): ReactElement {
  const t = useTranslations("dashboard.welcome");

  return (
    <motion.div variants={itemVariants}>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        {t("title", { name: firstName })} <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-1 text-sm text-muted sm:text-base">{t("subtitle")}</p>
    </motion.div>
  );
}

type FilterId = "all" | TaskStatus;

const taskFilters: FilterId[] = ["all", "In Progress", "To Do", "Pending Review", "Complete"];

const filterKeys: Record<FilterId, "all" | "inProgress" | "toDo" | "pendingReview" | "complete"> = {
  all: "all",
  ...statusKeys,
};

// Only the SELECTED filter shows its semantic tone; every other filter stays a plain
// white pill (never gray) until it's selected — the pastel fill itself is the only
// selection indicator, so there's no separate active ring.
const filterTones: Record<FilterId, Tone> = {
  all: "red",
  "In Progress": statusTones["In Progress"],
  "To Do": statusTones["To Do"],
  "Pending Review": statusTones["Pending Review"],
  Complete: statusTones.Complete,
};

function TasksPanel({ tasks, searchQuery }: { tasks: DashboardTask[]; searchQuery: string }): ReactElement {
  const t = useTranslations("dashboard.tasks");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const counts: Record<FilterId, number> = {
    all: tasks.length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    "To Do": tasks.filter((task) => task.status === "To Do").length,
    "Pending Review": tasks.filter((task) => task.status === "Pending Review").length,
    Complete: tasks.filter((task) => task.status === "Complete").length,
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = activeFilter === "all" || task.status === activeFilter;
    const matchesSearch = normalizedQuery.length === 0 || task.title.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby="my-tasks-heading"
      className={DASHBOARD_CARD}
    >
      <div className="mb-4 flex flex-col gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <h2 id="my-tasks-heading" className={CARD_TITLE}>
          <IconChecklist className="h-5 w-5 shrink-0" />
          {t("title")}
        </h2>

        <div className="flex flex-wrap items-center gap-2 lg:justify-center" role="group" aria-label={t("filterLabel")}>
          {taskFilters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/40 ${
                  isActive ? `border-transparent ${toneColors[filterTones[filter]]}` : "border-border bg-surface text-foreground hover:bg-surface-muted"
                }`}
              >
                {t("filterWithCount", { label: t(`filters.${filterKeys[filter]}`), count: counts[filter] })}
              </button>
            );
          })}

          {/* Mobile only: inline in the wrapping filter row so it lands, pushed to the far
              end, on whichever line the last filter pill wraps onto. Replaced by the
              separate right-aligned copy below from `sm:` up. */}
          <div className="ms-auto lg:hidden">
            <ViewAllBadge href={TASKS_HREF} label={t("viewAll")} tone="blue" />
          </div>
        </div>

        <div className="hidden lg:flex lg:justify-end">
          <ViewAllBadge href={TASKS_HREF} label={t("viewAll")} tone="blue" />
        </div>
      </div>

      <TaskProgress tasks={tasks} className="mb-4" />

      {filteredTasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-6 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-hidden md:block">
            <table className="w-full table-fixed border-collapse text-start text-sm">
              <colgroup>
                <col className="w-12" />
                <col />
                <col className="w-[18%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-surface-muted/60 text-start text-xs font-medium uppercase tracking-wide text-muted">
                  <th scope="col" className="rounded-s-lg py-2.5 ps-3" />
                  <th scope="col" className="py-2 text-start">
                    {t("columns.task")}
                  </th>
                  <th scope="col" className="py-2 text-start">
                    {t("columns.deadline")}
                  </th>
                  <th scope="col" className="py-2 text-start">
                    {t("columns.priority")}
                  </th>
                  <th scope="col" className="rounded-e-lg py-2 pe-3 text-start">
                    {t("columns.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted/40"
                  >
                    <td className="py-3 ps-3">
                      <Checkbox checked={task.status === "Complete"} />
                    </td>
                    <td className="py-3 pe-4">
                      <p className={`truncate text-sm font-medium text-foreground ${task.status === "Complete" ? "text-muted line-through decoration-muted" : ""}`}>
                        {task.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">{task.description}</p>
                    </td>
                    <td className="py-3 pe-4 text-foreground/70">{task.deadline}</td>
                    <td className="py-3 pe-4">
                      <TaskBadge className={priorityStyles[task.priority]}>{t(`priority.${priorityKeys[task.priority]}`)}</TaskBadge>
                    </td>
                    <td className="py-3">
                      <TaskBadge className={statusStyles[task.status]}>{t(`status.${statusKeys[task.status]}`)}</TaskBadge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {filteredTasks.map((task, index) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="rounded-xl border border-border p-3"
              >
                <div className="flex items-start gap-3">
                  <Checkbox checked={task.status === "Complete"} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium text-foreground ${task.status === "Complete" ? "text-muted line-through decoration-muted" : ""}`}>
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{task.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted">{task.deadline}</span>
                      <TaskBadge className={priorityStyles[task.priority]}>{t(`priority.${priorityKeys[task.priority]}`)}</TaskBadge>
                      <TaskBadge className={statusStyles[task.status]}>{t(`status.${statusKeys[task.status]}`)}</TaskBadge>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-4 flex justify-center">
        <PaginationDots count={3} activeIndex={0} />
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function DashboardPage(): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, tasks } = useMemberWorkspace();
  const [leaderAccess, setLeaderAccess] = useState<ReturnType<typeof getElevatedAccess>>(null);
  const today = useTodayLabel();
  const accessProfile = leaderAccess && leaderDashboardMockData[leaderAccess.committee];
  const accessHref = leaderAccess && leaderCommitteeConfig[leaderAccess.committee].routeBase;
  const accessInitials = accessProfile?.name
    .split(/\s+/)
    .filter((part) => part !== "Committee")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const checkAccess = () => {
      const access = getElevatedAccess();
      setLeaderAccess(access);
    };

    checkAccess();
    window.addEventListener("storage", checkAccess);
    const interval = setInterval(checkAccess, 5000);
    return () => {
      window.removeEventListener("storage", checkAccess);
      clearInterval(interval);
    };
  }, []);

  return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      <UtilityRow today={today} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <WelcomeSection firstName={user.name.split(" ")[0]} />

      {/* Leader Workspace Banner: Only shown when Leader explicitly granted elevated access */}
      {leaderAccess && accessProfile && accessHref && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3 rounded-2xl border border-blue-500/30 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-blue-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
              {accessInitials}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Leader Access Granted
              </span>
              <p className="text-sm font-semibold text-foreground">
                {accessProfile.name} Leader Workspace
              </p>
            </div>
          </div>
          <Link
            href={accessHref}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            Enter Leader Workspace →
          </Link>
        </motion.div>
      )}

      <MembersCompactNav />
      <SearchField searchQuery={searchQuery} onSearchChange={setSearchQuery} className="lg:hidden" />
      <MemberEventCards tiles={myEventTiles} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <DashboardUpcomingEvents />
        <MemberCalendarCard />
      </div>
      <TasksPanel tasks={tasks} searchQuery={searchQuery} />
    </motion.div>
  );
}
