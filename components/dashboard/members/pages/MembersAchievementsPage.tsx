"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowDownUp, Crown, Medal, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  achievementMembers,
  mockCurrentCommitteeId,
  mockCurrentUserId,
} from "@/components/dashboard/members/achievements-mock-data";
import type { AchievementMember } from "@/components/dashboard/members/achievements-mock-data";

interface RankedMember extends AchievementMember {
  rank: number;
}

// Mock scoping for demonstration only — not access control. Ties share a rank (1, 2, 2, 4).
function buildLeaderboard(): RankedMember[] {
  const sorted = achievementMembers
    .filter((member) => member.committeeId === mockCurrentCommitteeId && !member.isLeader)
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  const ranked: RankedMember[] = [];
  sorted.forEach((member, index) => {
    const prev = ranked[index - 1];
    ranked.push({ ...member, rank: prev && prev.points === member.points ? prev.rank : index + 1 });
  });
  return ranked;
}

const leaderboard = buildLeaderboard();

type SortOrder = "desc" | "asc";

interface PodiumTone {
  card: string;
  base: string;
  icon: string;
  Icon: LucideIcon;
}

// Gold / silver / bronze mapped onto the theme-aware dashboard palette (yellow / neutral / red).
const goldTone: PodiumTone = {
  card: "bg-[var(--dashboard-yellow-bg)]/50 border-[var(--dashboard-yellow-text)]/30",
  base: "bg-[var(--dashboard-yellow-bg)] text-[var(--dashboard-yellow-text)]",
  icon: "text-[var(--dashboard-yellow-text)]",
  Icon: Crown,
};
const silverTone: PodiumTone = {
  card: "bg-surface-muted/60 border-border",
  base: "bg-surface-muted text-foreground",
  icon: "text-muted",
  Icon: Medal,
};
const bronzeTone: PodiumTone = {
  card: "bg-[var(--dashboard-red-bg)]/50 border-[var(--dashboard-red-text)]/30",
  base: "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]",
  icon: "text-[var(--dashboard-red-text)]",
  Icon: Medal,
};

// Visual order (start → end): 2nd, 1st, 3rd. `index` is the position in the leaderboard.
const podiumSlots = [
  { index: 1, tone: silverTone, base: "h-16 sm:h-24", card: "pt-6", iconPos: "start-2" },
  { index: 0, tone: goldTone, base: "h-24 sm:h-32", card: "pt-9", iconPos: "start-1/2 -translate-x-1/2 rtl:translate-x-1/2" },
  { index: 2, tone: bronzeTone, base: "h-10 sm:h-14", card: "pt-6", iconPos: "start-2" },
];

const rowIcons: Record<number, { Icon: LucideIcon; className: string }> = {
  1: { Icon: Crown, className: "text-[var(--dashboard-yellow-text)]" },
  2: { Icon: Medal, className: "text-muted" },
  3: { Icon: Medal, className: "text-[var(--dashboard-red-text)]" },
};

function Avatar({ initials, className }: { initials: string; className: string }): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-blue-bg)] font-semibold text-[var(--dashboard-blue-text)] ${className}`}
    >
      {initials}
    </span>
  );
}

// Read-only: nothing here edits points or ranks.
export function MembersAchievementsPage(): ReactElement {
  const t = useTranslations("dashboard.achievements");
  const format = useFormatter();
  const me = leaderboard.find((member) => member.id === mockCurrentUserId);
  const dash = "—";
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const sortLabels = { desc: t("sortHighToLow"), asc: t("sortLowToHigh") };
  const sortToggleLabel = t("sortToggle", {
    current: sortLabels[sortOrder],
    next: sortLabels[sortOrder === "desc" ? "asc" : "desc"],
  });
  // Ranks stay descending-based; ascending only reverses the display order (ties by name, stable).
  const displayedLeaderboard =
    sortOrder === "desc"
      ? leaderboard
      : [...leaderboard].sort((a, b) => a.points - b.points || a.name.localeCompare(b.name));

  const stats = [
    {
      key: "points",
      value: me ? format.number(me.points) : dash,
      Icon: Star,
      card: "bg-[var(--dashboard-blue-bg)]/60",
      tile: "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]",
    },
    {
      key: "rank",
      value: me ? `#${format.number(me.rank)}` : dash,
      Icon: Medal,
      card: "bg-[var(--dashboard-green-bg)]/60",
      tile: "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]",
    },
  ];

  return (
    <div className="space-y-6">
      <section aria-label={t("statsLabel")}>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map(({ key, value, Icon, card, tile }) => (
            <li key={key} className={`flex items-center gap-4 rounded-2xl border border-border p-4 sm:p-5 ${card}`}>
              <span className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                <Icon aria-hidden="true" className="size-7" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-muted">{t(`stats.${key}`)}</p>
                <p className="text-3xl font-bold text-foreground">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {leaderboard.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center text-sm text-muted"
        >
          {t("empty")}
        </div>
      ) : (
        <>
          <section aria-labelledby="podium-heading" className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <h2 id="podium-heading" className="text-base font-bold text-foreground">
              {t("podiumTitle")}
            </h2>
            <p className="text-xs text-muted">{t("podiumSubtitle")}</p>
            <ol className="mt-5 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {podiumSlots.map((slot) => {
                const member = leaderboard[slot.index];
                if (!member) return <li key={slot.index} aria-hidden="true" />;
                const { tone } = slot;
                return (
                  <li
                    key={slot.index}
                    className={`relative flex min-w-0 flex-col items-center overflow-hidden rounded-2xl border text-center ${tone.card} ${slot.card}`}
                  >
                    <tone.Icon
                      aria-hidden="true"
                      className={`absolute top-2 size-5 sm:size-6 ${slot.iconPos} ${tone.icon}`}
                    />
                    <Avatar
                      initials={member.initials}
                      className={slot.index === 0 ? "size-12 text-base sm:size-14 sm:text-lg" : "size-10 text-sm sm:size-12 sm:text-base"}
                    />
                    <p className="mt-2 w-full truncate px-1 text-xs font-semibold text-foreground sm:text-sm">
                      {member.name}
                    </p>
                    <p className="mb-3 text-xs text-muted">{t("pointsValue", { points: member.points })}</p>
                    <div
                      className={`flex w-full items-center justify-center rounded-t-2xl text-lg font-bold sm:text-2xl ${tone.base} ${slot.base}`}
                    >
                      <span aria-label={t("rankLabel", { rank: member.rank })}>#{format.number(member.rank)}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="leaderboard-heading" className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]">
                  <Users aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 id="leaderboard-heading" className="text-base font-bold text-foreground">
                    {t("leaderboardTitle")}
                  </h2>
                  <p className="text-xs text-muted">{t("leaderboardSubtitle")}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                aria-label={sortToggleLabel}
                title={sortToggleLabel}
                className="ms-auto flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground focus-visible:border-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
              >
                <ArrowDownUp aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th scope="col" className="w-16 py-2 ps-3 text-start font-medium sm:w-20">
                      {t("columns.rank")}
                    </th>
                    <th scope="col" className="py-2 text-start font-medium">
                      {t("columns.member")}
                    </th>
                    <th scope="col" className="py-2 pe-3 text-end font-medium">
                      {t("columns.points")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedLeaderboard.map((member) => {
                    const isMe = member.id === mockCurrentUserId;
                    const rowIcon = rowIcons[member.rank];
                    return (
                      <tr
                        key={member.id}
                        aria-current={isMe ? "true" : undefined}
                        className={
                          isMe
                            ? "bg-[var(--dashboard-red-bg)] font-semibold text-[var(--dashboard-red-text)]"
                            : "text-foreground"
                        }
                      >
                        <td className="py-2.5 ps-3">
                          <span className="flex items-center gap-1.5 font-semibold">
                            {rowIcon ? (
                              <rowIcon.Icon aria-hidden="true" className={`size-4 shrink-0 ${rowIcon.className}`} />
                            ) : (
                              <span aria-hidden="true" className="size-4 shrink-0" />
                            )}
                            #{format.number(member.rank)}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="flex min-w-0 items-center gap-3">
                            <Avatar initials={member.initials} className="size-8 text-xs" />
                            <span className="min-w-0 truncate">
                              {member.name}
                              {isMe && <span className="ms-1.5">({t("you")})</span>}
                            </span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-2.5 pe-3 text-end font-semibold">
                          {t("pointsValue", { points: member.points })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
