"use client";

import { useId, useState } from "react";
import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Search, UsersRound } from "lucide-react";

import { directoryMembers, mockCurrentTeamId } from "@/components/dashboard/members/members-directory-mock-data";
import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { PILL_SHAPE } from "@/components/dashboard/members/task-styles";

type DirectoryFilter = "myTeam" | "otherTeams" | "all";

const filters: DirectoryFilter[] = ["myTeam", "otherTeams", "all"];

// Soft avatar/badge pairs from the theme-aware dashboard palette, assigned per member by position
// in the dataset so each member keeps the same color regardless of filter or sort.
const memberTones = [
  "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]",
  "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]",
  "bg-[var(--dashboard-yellow-bg)] text-[var(--dashboard-yellow-text)]",
  "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]",
];

// Each filter keeps its own dashboard palette pair (theme-aware bg/text tokens) in light and dark.
const filterStyles: Record<DirectoryFilter, { active: string; idle: string }> = {
  myTeam: {
    active: "border-[var(--dashboard-blue-text)] bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]",
    idle: "border-border bg-surface text-[var(--dashboard-blue-text)] hover:bg-[var(--dashboard-blue-bg)]",
  },
  otherTeams: {
    active: "border-[var(--dashboard-green-text)] bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]",
    idle: "border-border bg-surface text-[var(--dashboard-green-text)] hover:bg-[var(--dashboard-green-bg)]",
  },
  all: {
    active: "border-[var(--dashboard-yellow-text)] bg-[var(--dashboard-yellow-bg)] text-[var(--dashboard-yellow-text)]",
    idle: "border-border bg-surface text-[var(--dashboard-yellow-text)] hover:bg-[var(--dashboard-yellow-bg)]",
  },
};

// Mock filtering for demonstration only — not access control.
function matchesFilter(teamId: string, filter: DirectoryFilter): boolean {
  if (filter === "myTeam") return teamId === mockCurrentTeamId;
  if (filter === "otherTeams") return teamId !== mockCurrentTeamId;
  return true;
}

// Read-only directory: no profiles, clickable cards, or member actions.
export function MembersDirectoryPage(): ReactElement {
  const t = useTranslations("dashboard.directory");
  const searchId = useId();
  const [filter, setFilter] = useState<DirectoryFilter>("myTeam");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleMembers = directoryMembers.filter(
    (member) =>
      matchesFilter(member.teamId, filter) && member.name.toLocaleLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]">
          <UsersRound aria-hidden="true" className="size-5" />
        </span>
        <p className="min-w-0 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t("searchLabel")}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full rounded-xl border border-border bg-surface ps-10 pe-4 text-sm text-foreground placeholder:text-muted focus-visible:border-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
        />
      </div>

      <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap gap-2">
        {filters.map((option) => {
          const active = filter === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30 ${
                active ? `${filterStyles[option].active} font-semibold` : filterStyles[option].idle
              }`}
            >
              {t(`filters.${option}`)}
            </button>
          );
        })}
      </div>

      <p role="status" className="sr-only">
        {t("resultsCount", { count: visibleMembers.length })}
      </p>

      {visibleMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center text-sm text-muted">
          {normalizedQuery ? t("emptySearch") : t("empty")}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member) => {
            const tone = memberTones[directoryMembers.indexOf(member) % memberTones.length];
            return (
              <li
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold ${tone}`}
                >
                  {member.initials}
                </span>
                <div className="flex min-w-0 flex-col items-start gap-1.5">
                  <h2 className="w-full truncate text-base font-semibold text-foreground">{member.name}</h2>
                  <TaskBadge className={`${PILL_SHAPE} max-w-full py-0.5 ${tone}`}>
                    <span className="truncate">{member.role}</span>
                  </TaskBadge>
                  <p className="w-full truncate text-xs text-muted">{member.team}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
