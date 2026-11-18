"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { advisorTheme, clubLeadershipTheme, committees as badgeCommitteeThemes, defaultTheme, developerLeadershipTheme } from "@/lib/badge/themes";
import { committeeRoles, type BadgeData, type CommitteeCode, type CommitteeRole, type Gender } from "@/lib/badge/types";
import { committeeTranslationKeys, leaderCommitteeConfig } from "@/components/dashboard/shared/committee-config";
import { committees as homeCommittees, teamMembers } from "@/data/home";
import type { Committee as HomeCommittee } from "@/components/home/CommitteeCard";

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

const isCommitteeCode = (code: string): code is CommitteeCode => Object.hasOwn(badgeCommitteeThemes, code);
const rank = (position: string) => committeeRoles.indexOf(position as CommitteeRole);
const allHomeCommittees: HomeCommittee[] = homeCommittees.flatMap((committee) => [committee, ...(committee.subCommittees ?? [])]);

function getCommitteeLeaderGender(committeeId: string): Gender | undefined {
  const homeCommitteeId = committeeId === "pr" ? "public-relations"
    : committeeId === "digital-media-design" ? "digital-media"
      : committeeId;
  const committee = allHomeCommittees.find((item) => item.id === homeCommitteeId);
  if (!committee || !("gender" in committee.lead)) return undefined;
  return committee.lead.gender as Gender | undefined;
}

// Builds a separate badge for every committee and leadership assignment.
export function useMemberBadges({ name, university, photoUrl, gender, committees: memberships, roles }: MemberBadgeInput) {
  const t = useTranslations("profile.badge");
  const committeeT = useTranslations("dashboard.leader");
  const silhouette: Gender = gender?.toLowerCase() === "male" ? "male" : "female";
  return useMemo(() => {
    const memberName = name?.trim() ?? "";
    if (!memberName) return [];
    const shared = {
      name: memberName,
      chapter: t("chapter"),
      university: university?.trim() || t("university"),
      photoUrl: photoUrl ?? null,
      gender: silhouette,
    };
    const groupLeaderGender = (teamMembers.find((member) => member.type === "leader") as { gender?: Gender } | undefined)?.gender ?? "male";
    const badges = (memberships ?? [])
      .slice()
      .sort((a, b) => rank(b.position) - rank(a.position))
      .filter((membership) => Boolean(membership.position && membership.name?.trim()))
      .map((membership) => {
        const code = membership.code.toUpperCase();
        const config = Object.entries(leaderCommitteeConfig).find(([, value]) => value.committeeCode === code);
        const committeeLeaderGender = config ? getCommitteeLeaderGender(config[0]) ?? "male" : "male";
        const committee = config
          ? committeeT(`nav.${committeeTranslationKeys[config[0] as keyof typeof committeeTranslationKeys]}`)
          : membership.name!.trim();
        const role = membership.position === "Leader" ? t(`committeeRoles.leader.${silhouette}`)
          : membership.position === "Co-Leader" ? t(`committeeRoles.coLeader.${silhouette}.${committeeLeaderGender}`)
            : membership.position === "Member" ? t("committeeRoles.member")
              : membership.position;
        const data: BadgeData = { ...shared, role, committee };
        return {
          data,
          theme: isCommitteeCode(code) ? badgeCommitteeThemes[code].theme : defaultTheme,
          label: t("label", { name: data.name, role: data.role, committee: data.committee }),
          key: `committee-${code}-${membership.position}`,
        };
      });

    if (roles?.includes("GROUP_LEADER")) {
      const role = t(`globalRoles.groupLeader.${silhouette}`);
      const committee = "";
      const data: BadgeData = { ...shared, role, committee };
      badges.unshift({ data, theme: clubLeadershipTheme, label: t("globalLabel", { name: data.name, role }), key: "group-leader" });
    } else if (roles?.includes("GROUP_CO_LEADER")) {
      const role = t(`globalRoles.groupCoLeader.${silhouette}.${groupLeaderGender}`);
      const committee = "";
      const data: BadgeData = { ...shared, role, committee };
      badges.unshift({ data, theme: clubLeadershipTheme, label: t("globalLabel", { name: data.name, role }), key: "group-co-leader" });
    }
    if (roles?.includes("DEVELOPER_COMMITTEES_LEADER")) {
      const role = t(`globalRoles.developerCommitteesLeader.${silhouette}`);
      const committee = t("globalRoles.developerCommittees");
      const data: BadgeData = { ...shared, role, committee };
      badges.unshift({ data, theme: developerLeadershipTheme, label: t("label", { name: data.name, role, committee }), key: "developer-committees-leader" });
    }
    if (roles?.includes("ADVISOR")) {
      const role = t(`globalRoles.advisor.${silhouette}`);
      const data: BadgeData = { ...shared, role, committee: "" };
      badges.unshift({ data, theme: advisorTheme, label: t("globalLabel", { name: data.name, role }), key: "advisor" });
    }
    return badges;
  }, [name, university, photoUrl, silhouette, memberships, roles, t, committeeT]);
}
