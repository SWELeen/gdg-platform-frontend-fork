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

// Builds a member's badge from their profile and committees. Someone in several
// committees gets the one where they hold the highest position.
export function useMemberBadge({ name, university, photoUrl, gender, committees: memberships, roles }: MemberBadgeInput) {
  const t = useTranslations("profile.badge");
  const membership = memberships?.length
    ? [...memberships].sort((a, b) => rank(b.position) - rank(a.position))[0]
    : null;
  const globalBadge = roles?.includes("GROUP_LEADER")
    ? { role: t("globalRoles.groupLeader"), committee: t("globalRoles.groupLeadership"), theme: clubLeadershipTheme }
    : roles?.includes("GROUP_CO_LEADER")
      ? { role: t("globalRoles.groupCoLeader"), committee: t("globalRoles.groupLeadership"), theme: clubLeadershipTheme }
      : roles?.includes("DEVELOPER_COMMITTEES_LEADER")
        ? { role: t("globalRoles.developerCommitteesLeader"), committee: t("globalRoles.developerCommittees"), theme: developerLeadershipTheme }
        : null;
  const useCommitteeBadge = Boolean(membership && !globalBadge);
  const code = membership?.code ?? "";
  const role = membership?.position ?? "";
  const matched = useCommitteeBadge && isCommitteeCode(code);
  const silhouette: Gender = gender?.toLowerCase() === "male" ? "male" : "female";
  const badgeRole = globalBadge && !useCommitteeBadge ? globalBadge.role : role;
  const badgeCommittee = globalBadge && !useCommitteeBadge
    ? globalBadge.committee
    : membership?.name?.trim() ?? "";

  const data = useMemo<BadgeData>(() => {
    const shared = {
      chapter: "Google Developer Group on Campus",
      university: university?.trim() || "University of Jeddah",
      gender: silhouette,
    };
    return {
      ...shared,
      name: name?.trim() ?? "",
      role: badgeRole,
      committee: badgeCommittee,
      photoUrl: photoUrl ?? null,
    };
  }, [name, badgeRole, badgeCommittee, university, photoUrl, silhouette]);

  if ((!membership && !globalBadge) || !name?.trim() || !badgeRole || !badgeCommittee) return null;
  return {
    data,
    theme: globalBadge && !useCommitteeBadge
      ? globalBadge.theme
      : matched && useCommitteeBadge
        ? committees[code as CommitteeCode].theme
        : defaultTheme,
    label: t("label", { name: data.name, role: data.role, committee: data.committee }),
  };
}
