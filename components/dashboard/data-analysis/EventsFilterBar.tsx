"use client";

import { useEffect, useRef } from "react";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";
import { useTranslations } from "next-intl";
import { Search, RotateCcw, Calendar, ChevronDown } from "lucide-react";
import {
  eventDateFilterOptions,
  eventStatusFilterOptions,
  eventTypeFilterOptions,
} from "./mock-data";

const statusLabelKeys: Record<string, string> = {
  Upcoming: "upcoming",
  Completed: "completed",
  Draft: "draft",
  "Needs Update": "needsUpdate",
};

const dateLabelKeys: Record<string, string> = {
  all: "anyDate",
  upcoming: "next30Days",
  october: "october",
  november: "november",
};

const typeLabelKeys: Record<string, string> = {
  Workshop: "workshop",
  Conference: "conference",
  Talk: "talk",
  Panel: "panel",
  Hackathon: "hackathon",
  Trip: "trip",
};

export function EventsFilterBar() {
  const t = useTranslations("dashboard.leader");
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    resetFilters,
  } = useLeaderDashboard();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The search box advertises a ⌘K / Ctrl+K shortcut, so honor it.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isFiltered =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    dateFilter !== "all";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          ref={searchInputRef}
          type="search"
          aria-label={t("eventFilters.search")}
          aria-keyshortcuts="Meta+K Control+K"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("eventFilters.search")}
          className="h-10 w-full rounded-xl border border-border bg-surface-muted/40 ps-9 pe-12 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <span aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
          ⌘ K
        </span>
      </div>

      {/* Dropdown Filters & Clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Dropdown */}
        <div className="relative flex items-center">
          <select
            value={statusFilter}
            aria-label={t("eventFilters.statusLabel")}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-border bg-surface px-3 pe-8 text-xs font-medium text-foreground outline-none transition hover:bg-surface-muted focus:border-blue-500 cursor-pointer"
          >
            <option value="all">{t("eventFilters.allStatuses")}</option>
            {eventStatusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>{t(`eventFilters.${statusLabelKeys[option.value]}`)}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-2.5 size-3.5 text-muted" />
        </div>

        {/* Date Dropdown */}
        <div className="relative flex items-center">
          <Calendar className="pointer-events-none absolute start-2.5 size-3.5 text-muted" />
          <select
            value={dateFilter}
            aria-label={t("eventFilters.dateLabel")}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-border bg-surface ps-8 pe-8 text-xs font-medium text-foreground outline-none transition hover:bg-surface-muted focus:border-blue-500 cursor-pointer"
          >
            {eventDateFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>{t(`eventFilters.${dateLabelKeys[option.value]}`)}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-2.5 size-3.5 text-muted" />
        </div>

        {/* Event Type Dropdown */}
        <div className="relative flex items-center">
          <select
            value={typeFilter}
            aria-label={t("eventFilters.typeLabel")}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-border bg-surface px-3 pe-8 text-xs font-medium text-foreground outline-none transition hover:bg-surface-muted focus:border-blue-500 cursor-pointer"
          >
            <option value="all">{t("eventFilters.allTypes")}</option>
            {eventTypeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>{t(`eventFilters.${typeLabelKeys[option.value]}`)}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-2.5 size-3.5 text-muted" />
        </div>

        {/* Clear Filter button */}
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-xs font-medium text-muted transition hover:border-foreground/30 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("eventFilters.clear")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
