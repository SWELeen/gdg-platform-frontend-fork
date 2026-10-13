"use client";

import { useEffect, useId, useState } from "react";
import type { ReactElement } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CalendarDays, Check, Star, TrendingUp, TriangleAlert } from "lucide-react";

import { PillAction } from "@/components/announcements/PillAction";
import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { statusStyles } from "@/components/dashboard/members/task-styles";
import {
  memberCompletedTasks,
  memberPointHistory,
} from "@/components/dashboard/members/achievements-mock-data";

type RangeFilter = "allTime" | "thisMonth" | "last30Days" | "thisYear";
type LoadState = "loading" | "error" | "loaded";

const rangeOptions: RangeFilter[] = ["allTime", "thisMonth", "last30Days", "thisYear"];
const UTC_DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_VISIBLE_COUNT = 4;
const VISIBLE_COUNT_INCREMENT = 4;

function getUtcMonthKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function matchesRange(date: string, range: RangeFilter, now: Date): boolean {
  const entryTime = Date.parse(`${date}T00:00:00.000Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (entryTime > today) return false;
  if (range === "allTime") return true;
  if (range === "thisMonth") return date.startsWith(getUtcMonthKey(now));
  if (range === "thisYear") return date.startsWith(String(now.getUTCFullYear()));

  const firstIncludedDay = today - 29 * UTC_DAY_MS;
  return entryTime >= firstIncludedDay;
}

function signedAmount(amount: number, formatNumber: (value: number) => string): string {
  return `${amount >= 0 ? "+" : "−"}${formatNumber(Math.abs(amount))}`;
}

function LoadingState(): ReactElement {
  const t = useTranslations("dashboard.achievements");

  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl border border-border bg-surface-muted/50" />
        ))}
      </div>
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="space-y-5 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-surface-muted" />
          {Array.from({ length: 4 }, (_, row) => (
            <div key={row} className="h-10 animate-pulse rounded-lg bg-surface-muted/60" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }): ReactElement {
  const t = useTranslations("dashboard.achievements.error");
  const taskErrorT = useTranslations("dashboard.tasks.error");

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center sm:px-10 sm:py-16"
    >
      <TriangleAlert aria-hidden="true" className="size-8 text-gdg-red" strokeWidth={1.75} />
      <h2 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">{t("title")}</h2>
      <p className="mt-2 max-w-[440px] text-sm text-muted">{t("description")}</p>
      <div className="mt-6">
        <PillAction onClick={onRetry}>{taskErrorT("retry")}</PillAction>
      </div>
    </div>
  );
}

export function MembersAchievementsPage(): ReactElement {
  const t = useTranslations("dashboard.achievements");
  const format = useFormatter();
  const pointFilterId = useId();
  const taskFilterId = useId();
  const [pointRange, setPointRange] = useState<RangeFilter>("allTime");
  const [taskRange, setTaskRange] = useState<RangeFilter>("allTime");
  const [visiblePointCount, setVisiblePointCount] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleTaskCount, setVisibleTaskCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve({ memberPointHistory, memberCompletedTasks })
      .then(() => {
        if (isCurrent) setLoadState("loaded");
      })
      .catch((error: unknown) => {
        console.error("Failed to load personal achievements mock data.", error);
        if (isCurrent) setLoadState("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  const retry = (): void => {
    setLoadState("loading");
    setRetryCount((count) => count + 1);
  };

  const now = new Date();
  const monthKey = getUtcMonthKey(now);
  const totalPoints = memberPointHistory.reduce((total, entry) => total + entry.amount, 0);
  const monthPoints = memberPointHistory
    .filter((entry) => entry.date.startsWith(monthKey) && matchesRange(entry.date, "thisMonth", now))
    .reduce((total, entry) => total + entry.amount, 0);
  const monthTasks = memberCompletedTasks.filter((task) =>
    matchesRange(task.date, "thisMonth", now),
  ).length;

  const stats = [
    {
      key: "totalPoints",
      value: format.number(totalPoints),
      Icon: Star,
      card: "bg-[var(--dashboard-blue-bg)]/40",
      tile: "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]",
    },
    {
      key: "tasksCompleted",
      value: format.number(memberCompletedTasks.length),
      Icon: Check,
      card: "bg-[var(--dashboard-green-bg)]/40",
      tile: "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]",
    },
    {
      key: "tasksThisMonth",
      value: format.number(monthTasks),
      Icon: CalendarDays,
      card: "bg-[var(--dashboard-yellow-bg)]/45",
      tile: "bg-[var(--dashboard-yellow-bg)] text-[var(--dashboard-yellow-text)]",
    },
    {
      key: "pointsThisMonth",
      value: signedAmount(monthPoints, format.number),
      Icon: TrendingUp,
      card: "bg-[var(--dashboard-red-bg)]/40",
      tile: "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]",
    },
  ];

  const visiblePointEntries = memberPointHistory.filter((entry) =>
    matchesRange(entry.date, pointRange, now),
  );
  const visibleTasks = memberCompletedTasks.filter((task) =>
    matchesRange(task.date, taskRange, now),
  );
  const displayedPointEntries = visiblePointEntries.slice(0, visiblePointCount);
  const displayedTasks = visibleTasks.slice(0, visibleTaskCount);
  const pointListLabel = t("history.title");
  const taskListLabel = t("tasks.title");

  function formatDate(date: string): string {
    return format.dateTime(new Date(`${date}T12:00:00.000Z`), {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm text-muted">{t("pageSubtitle")}</p>

      {loadState === "loading" ? (
        <LoadingState />
      ) : loadState === "error" ? (
        <ErrorState onRetry={retry} />
      ) : (
        <>
          <section aria-label={t("statsLabel")}>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stats.map(({ key, value, Icon, card, tile }) => (
                <li
                  key={key}
                  className={`flex min-w-0 items-center gap-4 rounded-2xl border border-border p-4 sm:p-5 ${card}`}
                >
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl sm:size-14 ${tile}`}>
                    <Icon aria-hidden="true" className="size-6 sm:size-7" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted">{t(`stats.${key}`)}</p>
                    <p className="text-2xl font-bold text-foreground sm:text-3xl">
                      {key === "pointsThisMonth" ? <bdi dir="ltr">{value}</bdi> : value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="points-history-heading"
            className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="points-history-heading" className="text-base font-bold text-foreground">
                  {t("history.title")}
                </h2>
                <p className="text-xs text-muted">{t("history.subtitle")}</p>
              </div>
              <label htmlFor={pointFilterId} className="sr-only">
                {t("history.filterLabel")}
              </label>
              <select
                id={pointFilterId}
                value={pointRange}
                onChange={(event) => {
                  setPointRange(event.target.value as RangeFilter);
                  setVisiblePointCount(INITIAL_VISIBLE_COUNT);
                }}
                className="h-9 min-w-0 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground focus-visible:border-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
              >
                {rangeOptions.map((range) => (
                  <option key={range} value={range}>
                    {t(`ranges.${range}`)}
                  </option>
                ))}
              </select>
            </div>

            {visiblePointEntries.length === 0 ? (
              <div
                role="status"
                className="mt-5 rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-8 text-center text-sm text-muted"
              >
                {t("history.empty")}
              </div>
            ) : (
              <ul
                aria-label={pointListLabel}
                className="mt-3 divide-y divide-border"
              >
                {displayedPointEntries.map((entry) => {
                  const earned = entry.amount >= 0;
                  const tone = earned
                    ? "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]"
                    : "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]";

                  return (
                    <li key={entry.id} className="flex min-w-0 items-center gap-3 py-2.5">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tone}`}>
                        <Star aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {t(`history.entries.${entry.title}`)}
                        </p>
                        <p className="text-xs text-muted">{formatDate(entry.date)}</p>
                      </div>
                      <span
                        aria-label={t(earned ? "history.earned" : "history.lost", {
                          amount: format.number(Math.abs(entry.amount)),
                          unit: t("history.unit"),
                        })}
                        className={`shrink-0 text-end text-sm font-semibold ${earned ? "text-[var(--dashboard-green-text)]" : "text-[var(--dashboard-red-text)]"}`}
                      >
                        <bdi dir="ltr">{signedAmount(entry.amount, format.number)}</bdi>{" "}
                        {t("history.unit")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {visiblePointEntries.length > displayedPointEntries.length && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisiblePointCount((count) => count + VISIBLE_COUNT_INCREMENT)
                  }
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gdg-blue transition-colors hover:bg-[var(--dashboard-blue-bg)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
                >
                  {t("showMore")}
                </button>
              </div>
            )}
          </section>

          <section
            aria-labelledby="completed-tasks-heading"
            className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="completed-tasks-heading" className="text-base font-bold text-foreground">
                  {t("tasks.title")}
                </h2>
                <p className="text-xs text-muted">{t("tasks.subtitle")}</p>
              </div>
              <label htmlFor={taskFilterId} className="sr-only">
                {t("tasks.filterLabel")}
              </label>
              <select
                id={taskFilterId}
                value={taskRange}
                onChange={(event) => {
                  setTaskRange(event.target.value as RangeFilter);
                  setVisibleTaskCount(INITIAL_VISIBLE_COUNT);
                }}
                className="h-9 min-w-0 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground focus-visible:border-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
              >
                {rangeOptions.map((range) => (
                  <option key={range} value={range}>
                    {t(`ranges.${range}`)}
                  </option>
                ))}
              </select>
            </div>

            {visibleTasks.length === 0 ? (
              <div
                role="status"
                className="mt-5 rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-8 text-center text-sm text-muted"
              >
                {t("tasks.empty")}
              </div>
            ) : (
              <ul aria-label={taskListLabel} className="mt-3 divide-y divide-border">
                {displayedTasks.map((task) => (
                  <li key={task.id} className="flex min-w-0 items-center gap-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]">
                      <Check aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {t(`tasks.entries.${task.title}`)}
                      </p>
                      <p className="text-xs text-muted">{formatDate(task.date)}</p>
                    </div>
                    <TaskBadge className={`${statusStyles.Complete} shrink-0`}>
                      {t("tasks.completed")}
                    </TaskBadge>
                  </li>
                ))}
              </ul>
            )}
            {visibleTasks.length > displayedTasks.length && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleTaskCount((count) => count + VISIBLE_COUNT_INCREMENT)
                  }
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gdg-blue transition-colors hover:bg-[var(--dashboard-blue-bg)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
                >
                  {t("showMore")}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
