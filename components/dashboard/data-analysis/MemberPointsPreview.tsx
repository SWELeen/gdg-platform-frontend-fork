"use client";

import { useLeaderDashboard } from "../shared/LeaderDashboardContext";
import { useTranslations } from "next-intl";
import type { CommitteeMember } from "../shared/types";
import { Link } from "@/i18n/navigation";
import { leaderCommitteeConfig } from "../shared/committee-config";

interface MemberPointsPreviewProps {
  onUpdatePoints: (member: CommitteeMember) => void;
}

export function MemberPointsPreview({ onUpdatePoints }: MemberPointsPreviewProps) {
  const { members, canManagePoints, committee } = useLeaderDashboard();
  const pointsHref = `${leaderCommitteeConfig[committee].routeBase}/points`;
  const t = useTranslations("dashboard.leader");

  const previewMembers = members.slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t("points.previewTitle")}
          </h2>
          <p className="text-xs text-muted">
            {t("points.previewDescription")}
          </p>
        </div>
        <Link
          href={pointsHref}
          className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("points.historyLink")}
        </Link>
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
              <th className="py-3 text-start">{t("points.member")}</th>
              <th className="py-3 text-start">{t("points.points")}</th>
              <th className="py-3 text-start">{t("points.tasks")}</th>
              <th className="py-3 text-start">{t("points.lastActivity")}</th>
              <th className="py-3 text-start">{t("members.status")}</th>
              <th className="py-3 text-end"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {previewMembers.map((member) => (
              <tr key={member.id} className="transition hover:bg-surface-muted/20">
                <td className="py-3 pe-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${member.avatarBgColor}`}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">
                        {member.name}
                      </span>
                      <span className="block text-[11px] text-muted">
                        {member.role}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 pe-4 font-bold text-blue-600 dark:text-blue-400">
                  {member.points.toLocaleString()}
                </td>
                <td className="py-3 pe-4 text-foreground/80">
                  {member.tasksCompleted}
                </td>
                <td className="py-3 pe-4 text-muted whitespace-nowrap">
                  {member.lastActivity}
                </td>
                <td className="py-3 pe-4">
                  {member.status === "Active" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-600" />
                      {t("members.active")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      <span className="size-1.5 rounded-full bg-amber-600" />
                      {t("members.away")}
                    </span>
                  )}
                </td>
                <td className="py-3 text-end">
                  {canManagePoints && (
                    <button
                      type="button"
                      onClick={() => onUpdatePoints(member)}
                      className="rounded-xl border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
                    >
                      {t("points.updatePoints")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
