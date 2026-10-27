"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { committees, defaultTheme } from "@/lib/badge/themes";
import { committeeRoles, type BadgeData, type CommitteeCode, type CommitteeRole, type Gender } from "@/lib/badge/types";

// Loosely typed on purpose: these come straight from /me, so anything that
// doesn't match is caught here instead of breaking the card.
type MemberBadgeInput = {
  name?: string | null;
  university?: string | null;
  photoUrl?: string | null;
  /** "male" (any case) gets the male silhouette; anything else, or nothing, the female one. */
  gender?: string | null;
  /** The member's committees from /me. None: they get no badge. */
  committees?: Array<{ code: string; position: string }> | null;
};

const isCommitteeCode = (code: string): code is CommitteeCode => Object.hasOwn(committees, code);
const rank = (position: string) => committeeRoles.indexOf(position as CommitteeRole);

// TEMPORARY: until every committee code and position is confirmed, a committee
// or position that doesn't match (or a missing name) shows this all-placeholder
// card instead of a wrong one.
const placeholder = { role: "Role", committee: "Committee name", name: "Member name" };

// Builds a member's badge from their profile and committees. Someone in several
// committees gets the one where they hold the highest position.
export function useMemberBadge({ name, university, photoUrl, gender, committees: memberships }: MemberBadgeInput) {
  const t = useTranslations("profile.badge");
  const membership = memberships?.length
    ? [...memberships].sort((a, b) => rank(b.position) - rank(a.position))[0]
    : null;
  const code = membership?.code ?? "";
  const role = membership?.position ?? "";
  const matched = isCommitteeCode(code) && rank(role) >= 0 && Boolean(name?.trim());
  const silhouette: Gender = gender?.toLowerCase() === "male" ? "male" : "female";

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
      role,
      committee: committees[code as CommitteeCode].shortName,
      photoUrl: photoUrl ?? null,
    };
  }, [matched, name, role, code, university, photoUrl, silhouette]);

  if (!membership) return null;
  return {
    data,
    theme: matched ? committees[code as CommitteeCode].theme : defaultTheme,
    label: t("label", { name: data.name, role: data.role, committee: data.committee }),
  };
}
