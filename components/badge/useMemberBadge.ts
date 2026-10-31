"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { clubLeadershipTheme, committees, defaultTheme, developerLeadershipTheme } from "@/lib/badge/themes";
import { committeeRoles, type BadgeData, type CommitteeCode, type CommitteeRole, type Gender } from "@/lib/badge/types";

// Loosely typed on purpose: these come straight from /me, so anything that
// doesn't match is caught here instead of breaking the card.
type MemberBadgeInput = {
  name?: string | null;
  university?: string | null;
  photoUrl?: string | null;
  /** "male" (any case) gets the male silhouette; anything else, or nothing, the female one. */
  gender?: string | null;
  /** Committee assignments, including the committee's database name. */
  committees?: Array<{ code: string; name?: string; position: string }> | null;
  /** Global leadership roles from /me. */
  roles?: string[] | null;
};

const isCommitteeCode = (code: string): code is CommitteeCode => Object.hasOwn(committees, code);
const rank = (position: string) => committeeRoles.indexOf(position as CommitteeRole);

// Builds a separate badge for every committee and leadership assignment.
export function useMemberBadges({ name, university, photoUrl, gender, committees: memberships, roles }: MemberBadgeInput) {
  const t = useTranslations("profile.badge");
  const silhouette: Gender = gender?.toLowerCase() === "male" ? "male" : "female";
  return useMemo(() => {
    const memberName = name?.trim() ?? "";
    if (!memberName) return [];
    const shared = {
      name: memberName,
      chapter: "Google Developer Group on Campus",
      university: university?.trim() || "University of Jeddah",
      photoUrl: photoUrl ?? null,
      gender: silhouette,
    };
    const badges = (memberships ?? [])
      .slice()
      .sort((a, b) => rank(b.position) - rank(a.position))
      .filter((membership) => Boolean(membership.position && membership.name?.trim()))
      .map((membership) => {
        const code = membership.code.toUpperCase();
        const committee = membership.name!.trim();
        const data: BadgeData = { ...shared, role: membership.position, committee };
        return {
          data,
          theme: isCommitteeCode(code) ? committees[code].theme : defaultTheme,
          label: t("label", { name: data.name, role: data.role, committee: data.committee }),
          key: `committee-${code}-${membership.position}`,
        };
      });

    if (roles?.includes("GROUP_LEADER")) {
      const role = t("globalRoles.groupLeader");
      const committee = t("globalRoles.groupLeadership");
      const data: BadgeData = { ...shared, role, committee };
      badges.unshift({ data, theme: clubLeadershipTheme, label: t("label", { name: data.name, role, committee }), key: "group-leader" });
    } else if (roles?.includes("GROUP_CO_LEADER")) {
      const role = t("globalRoles.groupCoLeader");
      const committee = t("globalRoles.groupLeadership");
      const data: BadgeData = { ...shared, role, committee };
      badges.unshift({ data, theme: clubLeadershipTheme, label: t("label", { name: data.name, role, committee }), key: "group-co-leader" });
    }
    if (roles?.includes("DEVELOPER_COMMITTEES_LEADER")) {
      const role = t("globalRoles.developerCommitteesLeader");
      const committee = t("globalRoles.developerCommittees");
      const data: BadgeData = { ...shared, role, committee };
      badges.unshift({ data, theme: developerLeadershipTheme, label: t("label", { name: data.name, role, committee }), key: "developer-committees-leader" });
    }
    return badges;
  }, [name, university, photoUrl, silhouette, memberships, roles, t]);
}
