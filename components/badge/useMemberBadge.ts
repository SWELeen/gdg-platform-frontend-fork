"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { committees, defaultTheme } from "@/lib/badge/themes";
import { committeeRoles, type BadgeData, type CommitteeId, type CommitteeRole, type Gender } from "@/lib/badge/types";

// Loosely typed on purpose: these may come straight from an API response, so
// anything that doesn't match is caught here instead of breaking the card.
type MemberBadgeInput = {
  name?: string | null;
  university?: string | null;
  photoUrl?: string | null;
  /** "male" gets the male silhouette; anything else, or nothing, the female one. */
  gender?: string | null;
  /** null for someone who isn't in a committee: they get no badge. */
  membership: { committeeId?: string | null; role?: string | null } | null;
};

const isCommitteeId = (id: unknown): id is CommitteeId => typeof id === "string" && Object.hasOwn(committees, id);
const isRole = (role: unknown): role is CommitteeRole => committeeRoles.includes(role as CommitteeRole);

// TEMPORARY: until the profile API's values are confirmed, a committee or role
// that doesn't match (or a missing name) shows this all-placeholder card
// instead of a wrong one.
const placeholder = { role: "Role", committee: "Committee name", name: "Member name" };

// Builds a member's badge from their profile and committee membership.
export function useMemberBadge({ name, university, photoUrl, gender, membership }: MemberBadgeInput) {
  const t = useTranslations("profile.badge");
  const committeeId = membership?.committeeId;
  const role = membership?.role;
  const matched = isCommitteeId(committeeId) && isRole(role) && Boolean(name?.trim());
  const silhouette: Gender = gender === "male" ? "male" : "female";

  const data = useMemo<BadgeData>(() => {
    const shared = {
      chapter: "Google Developer Group on Campus",
      university: university?.trim() || "University of Jeddah",
      gender: silhouette,
    };
    if (!matched) return { ...shared, ...placeholder, photoUrl: null };
    return {
      ...shared,
      name: name!.trim(),
      role: role as CommitteeRole,
      committee: committees[committeeId as CommitteeId].shortName,
      photoUrl: photoUrl ?? null,
    };
  }, [matched, name, role, committeeId, university, photoUrl, silhouette]);

  if (!membership) return null;
  return {
    data,
    theme: matched ? committees[committeeId as CommitteeId].theme : defaultTheme,
    label: t("label", { name: data.name, role: data.role, committee: data.committee }),
  };
}
