"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ANNOUNCEMENTS_PAGE_SIZE,
  filterAnnouncements,
  paginate,
  sortAnnouncements,
  type CategoryFilter,
  type SortOrder,
} from "@/lib/announcements/query";
import type { Announcement } from "@/lib/announcements/types";
import { AnnouncementCard } from "./AnnouncementCard";
import { AnnouncementsCarousel } from "./AnnouncementsCarousel";
import { AnnouncementControls } from "./AnnouncementControls";
import { AnnouncementsEmptyState, AnnouncementsNoResults } from "./AnnouncementStates";
import { AnnouncementsPagination } from "./AnnouncementsPagination";
import { PinnedAnnouncementCard } from "./PinnedAnnouncementCard";

// Owns the listing's UI state (search, category, sort, page) and composes the
// sections. Receives already-loaded announcements, so it does not care whether
// they came from fixtures or the future API.
export function AnnouncementsExplorer({ announcements }: { announcements: Announcement[] }) {
  const t = useTranslations("announcements");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLElement>(null);

  const visible = useMemo(
    () => sortAnnouncements(filterAnnouncements(announcements, { query, category }), sort),
    [announcements, query, category, sort],
  );

  // The newest matching pinned announcement is featured; everything else is in the grid.
  const pinned = visible.find((announcement) => announcement.pinned);
  const listed = visible.filter((announcement) => announcement !== pinned);
  const { items, currentPage, pageCount } = paginate(listed, page, ANNOUNCEMENTS_PAGE_SIZE);

  const updateQuery = (next: string) => {
    setQuery(next);
    setPage(1);
  };
  const updateCategory = (next: CategoryFilter) => {
    setCategory(next);
    setPage(1);
  };
  const updateSort = (next: SortOrder) => {
    setSort(next);
    setPage(1);
  };
  const browseAll = () => {
    setQuery("");
    setCategory("all");
    setPage(1);
  };
  const changePage = (next: number) => {
    setPage(next);
    listRef.current?.scrollIntoView({ block: "start" });
  };

  const renderContent = () => {
    if (announcements.length === 0) return <AnnouncementsEmptyState />;

    if (visible.length === 0) {
      return query.trim() ? (
        <AnnouncementsNoResults
          query={query.trim()}
          onClearSearch={() => updateQuery("")}
          onBrowseAll={browseAll}
        />
      ) : (
        <AnnouncementsEmptyState
          categoryLabel={category === "all" ? undefined : t(`categories.${category}`)}
          onBrowseAll={browseAll}
        />
      );
    }

    return (
      <>
        {pinned && (
          <section aria-labelledby="pinned-announcement-heading">
            <h2 id="pinned-announcement-heading" className="sr-only">
              {t("pinned.heading")}
            </h2>
            <PinnedAnnouncementCard announcement={pinned} />
          </section>
        )}

        {listed.length > 0 && (
          <section
            ref={listRef}
            aria-labelledby="all-announcements-heading"
            className="mt-14 flex flex-col gap-6 first:mt-0"
          >
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <h2
                id="all-announcements-heading"
                className="text-3xl font-bold leading-snug text-foreground"
              >
                {t("list.heading")}
              </h2>
              <p aria-live="polite" className="text-sm text-gray-400">
                <span className="lg:hidden">{t("list.count", { total: listed.length })}</span>
                <span className="hidden lg:inline">
                  {t("list.showing", { shown: items.length, total: listed.length })}
                </span>
              </p>
            </div>

            {/* Mobile / Tablet: one swipeable row over the whole filtered list (no pagination).
                Keyed on the controls so it restarts at the first card when results change. */}
            <div className="lg:hidden">
              <AnnouncementsCarousel
                key={`${query}|${category}|${sort}`}
                announcements={listed}
              />
            </div>

            {/* Desktop: approved paginated grid. */}
            <div className="hidden flex-col gap-6 lg:flex">
              <ul className="grid grid-cols-3 gap-5">
                {items.map((announcement) => (
                  <li key={announcement.id}>
                    <AnnouncementCard announcement={announcement} />
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <AnnouncementsPagination
                  currentPage={currentPage}
                  pageCount={pageCount}
                  onPageChange={changePage}
                />
              </div>
            </div>
          </section>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {announcements.length > 0 && (
        <AnnouncementControls
          query={query}
          onQueryChange={updateQuery}
          category={category}
          onCategoryChange={updateCategory}
          sort={sort}
          onSortChange={updateSort}
          publishedCount={visible.length}
        />
      )}

      <div>{renderContent()}</div>
    </div>
  );
}
